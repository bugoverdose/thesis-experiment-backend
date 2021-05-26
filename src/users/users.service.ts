import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import {
  CreateLocalAccountInput,
  CreateLocalAccountOutput,
} from './dtos/create-local-account';
import { KakaoLoginInput, KakaoLoginOutput } from './dtos/kakao-login';
import { LocalLoginInput, LocalLoginOutput } from './dtos/local-login';
import {
  LocalScreeningInput,
  LocalScreeningOutput,
} from './dtos/local-screening-response';
import {
  SaveAddressResponseInput,
  SaveAddressResponseOutput,
} from './dtos/save-address-response';
import { SaveResponseInput, SaveResponseOutput } from './dtos/save-response';
import {
  SaveUserInfoResponseInput,
  SaveUserInfoResponseOutput,
} from './dtos/save-user-info-response';
import { SeeProfileInput, SeeProfileOutput } from './dtos/see-profile.dto';
import { AccountType, User } from './entities/users.entity';
import fetch from 'node-fetch';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private readonly InternalServerErrorOutput = {
    ok: false,
    error: 'Internal server error occurred.',
  };

  async seeProfile({ userId }: SeeProfileInput): Promise<SeeProfileOutput> {
    try {
      const user = await this.usersRepo.findOneOrFail(userId); // typeORM. Repo의 findOneOrFail 메서드: 못찾으면 에러 발생 => catch문으로 이동.
      if (!user) {
        return { ok: false, error: `Could not find user` };
      }
      return { ok: true, user };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async createLocalAccount({
    localId,
    password,
  }: CreateLocalAccountInput): Promise<CreateLocalAccountOutput> {
    try {
      const localIdTaken = await this.usersRepo.findOne({ localId });
      if (localIdTaken) {
        return {
          ok: false,
          error: '이미 존재하는 아이디입니다.',
        };
      }
      const newUser = this.usersRepo.create({
        localId,
        password,
        accountType: AccountType.Local,
      });
      const { id } = await this.usersRepo.save(newUser); // Repo.save 직전에 자동으로 @BeforeInsert() hashPassword 메서드 실행.
      return { ok: true, id };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async localLogin({
    localId,
    password,
  }: LocalLoginInput): Promise<LocalLoginOutput> {
    try {
      const user = await this.usersRepo.findOne(
        { localId },
        { select: ['id', 'password'] }, // 해당 칼럼의 데이터들만 가져오기.
      ); // { select: false } 옵션 적용된 칼럼들 선택하기 위해 필요.
      if (!user) {
        return {
          ok: false,
          error: `${localId}라는 아이디로 생성된 계정은 없습니다.`,
        };
      }
      const passwordCorrect = await user.checkPassword(password); // await 없으면 true/false가 아니라 Promise로 return됨. 즉 항상 참.
      if (!passwordCorrect) {
        return { ok: false, error: '틀린 비밀번호입니다.' };
      }
      const token = this.jwtService.sign(user.id);
      return { ok: true, token };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async kakaoLogin({ code }: KakaoLoginInput): Promise<KakaoLoginOutput> {
    try {
      const baseUrl = 'https://kauth.kakao.com/oauth/token';
      const config = {
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code,
      };
      const params = new URLSearchParams(config).toString();
      const finalUrl = `${baseUrl}?${params}`;
      console.log(finalUrl);
      const tokenRequest = await fetch(finalUrl, {
        method: 'POST', // npm i node-fetch
        headers: {
          'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });
      const tokenJson = await tokenRequest.json();
      // console.log('tokenJson: ', tokenJson);
      // tokenJson:  {
      //   access_token: 'Yre5JoaAWxOn6a8VgymbXHhSvTVJPOrHHJlLtAo9cpgAAAF5p-DpsQ',
      //   token_type: 'bearer',
      //   refresh_token: '-7-86ZiWq4cPG5y4WUivKHCzI1MoWCM7UR6IBwo9cpgAAAF5p-DpsA',
      //   expires_in: 21599,
      //   refresh_token_expires_in: 5183999
      // }

      if ('access_token' in tokenJson) {
        const { access_token } = tokenJson;
        const userRequest = await fetch(
          'https://kapi.kakao.com/v1/user/access_token_info',
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
          },
        );
        const kakaoUser = await userRequest.json();
        // console.log('kakaoUser: ', kakaoUser);
        // kakaoUser:  {
        //   id: 1745885460,
        //   expiresInMillis: 21599950,
        //   expires_in: 21599,
        //   app_id: 588014,
        //   appId: 588014
        // }

        let token;
        const existingUser = await this.usersRepo.findOne({
          kakaoId: kakaoUser.id,
        });
        if (!existingUser) {
          const newUser = this.usersRepo.create({
            kakaoId: kakaoUser.id,
            accountType: AccountType.Kakao,
          });
          const { id } = await this.usersRepo.save(newUser);
          token = this.jwtService.sign(id);
        } else {
          token = this.jwtService.sign(existingUser.id);
        }
        // console.log(token);
        return { ok: true, token };
      } else {
        return {
          ok: false,
          error: 'Failed to get an access token with the given code',
        };
      }
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async saveUserInfoResponse(
    currentUser: User,
    { target, response }: SaveUserInfoResponseInput,
  ): Promise<SaveUserInfoResponseOutput> {
    try {
      currentUser[target] = response; // ex) currentUser.age = response
      await this.usersRepo.save(currentUser);
      return { ok: true };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async saveResponse(
    currentUser: User,
    { questionNum, response }: SaveResponseInput,
  ): Promise<SaveResponseOutput> {
    try {
      currentUser[`question${questionNum}`] = response; // ex) currentUser.question1 = response
      await this.usersRepo.save(currentUser);
      return { ok: true };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async saveAddressResponse(
    currentUser: User,
    { response }: SaveAddressResponseInput,
  ): Promise<SaveAddressResponseOutput> {
    try {
      currentUser.address = response;
      await this.usersRepo.save(currentUser);
      return { ok: true };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async saveLocalScreeningResponse(
    currentUser: User,
    { response }: LocalScreeningInput,
  ): Promise<LocalScreeningOutput> {
    try {
      currentUser.localScreening = response;
      await this.usersRepo.save(currentUser);
      return { ok: true };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }
}
