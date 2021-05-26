import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Public } from 'src/auth/public.decorator';
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
import { User } from './entities/users.entity';
import { UsersService } from './users.service';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query((of) => User)
  loggedInUser(@AuthUser() authUser: User): User {
    return authUser;
  }

  @Query((of) => SeeProfileOutput)
  seeProfile(
    @Args('input') seeProfileInput: SeeProfileInput,
  ): Promise<SeeProfileOutput> {
    return this.usersService.seeProfile(seeProfileInput);
  }

  @Public()
  @Mutation((returns) => CreateLocalAccountOutput)
  createLocalAccount(
    @Args('input') createLocalAccountInput: CreateLocalAccountInput,
  ): Promise<CreateLocalAccountOutput> {
    return this.usersService.createLocalAccount(createLocalAccountInput);
  }

  @Public()
  @Mutation((of) => LocalLoginOutput)
  localLogin(
    @Args('input') loginInput: LocalLoginInput,
  ): Promise<LocalLoginOutput> {
    return this.usersService.localLogin(loginInput);
  }

  @Public()
  @Mutation((of) => KakaoLoginOutput)
  kakaoLogin(
    @Args('input') kakaoLoginInput: KakaoLoginInput,
  ): Promise<KakaoLoginOutput> {
    return this.usersService.kakaoLogin(kakaoLoginInput);
  }

  @Mutation((of) => SaveUserInfoResponseOutput)
  saveUserInfoResponse(
    @AuthUser() authUser: User,
    @Args('input') saveuserInfoResponseInput: SaveUserInfoResponseInput,
  ): Promise<SaveUserInfoResponseOutput> {
    return this.usersService.saveUserInfoResponse(
      authUser,
      saveuserInfoResponseInput,
    );
  }

  @Mutation((of) => SaveResponseOutput)
  saveResponse(
    @AuthUser() authUser: User,
    @Args('input') saveResponseInput: SaveResponseInput,
  ): Promise<SaveResponseOutput> {
    return this.usersService.saveResponse(authUser, saveResponseInput);
  }

  @Mutation((of) => SaveAddressResponseOutput)
  saveAddressResponse(
    @AuthUser() authUser: User,
    @Args('input') saveAddressResponseInput: SaveAddressResponseInput,
  ): Promise<SaveAddressResponseOutput> {
    return this.usersService.saveAddressResponse(
      authUser,
      saveAddressResponseInput,
    );
  }

  @Mutation((of) => LocalScreeningOutput)
  saveLocalScreeningResponse(
    @AuthUser() authUser: User,
    @Args('input') saveAddressResponseInput: LocalScreeningInput,
  ): Promise<LocalScreeningOutput> {
    return this.usersService.saveLocalScreeningResponse(
      authUser,
      saveAddressResponseInput,
    );
  }
}
