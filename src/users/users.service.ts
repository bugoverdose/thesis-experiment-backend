import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import {
  CreateLocalAccountInput,
  CreateLocalAccountOutput,
} from './dtos/create-local-account';
import { LocalLoginInput, LocalLoginOutput } from './dtos/local-login';
import { SaveResponseInput, SaveResponseOutput } from './dtos/save-response';
import { SeeProfileInput, SeeProfileOutput } from './dtos/see-profile.dto';
import { AccountType, User } from './entities/users.entity';

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
}
