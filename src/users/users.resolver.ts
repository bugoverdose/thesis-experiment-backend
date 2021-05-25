import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Public } from 'src/auth/public.decorator';
import {
  CreateLocalAccountInput,
  CreateLocalAccountOutput,
} from './dtos/create-local-account';
import { LocalLoginInput, LocalLoginOutput } from './dtos/local-login';
import { SaveResponseInput, SaveResponseOutput } from './dtos/save-response';
import { SeeProfileInput, SeeProfileOutput } from './dtos/see-profile.dto';
import { User } from './entities/users.entity';
import { UsersService } from './users.service';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

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

  @Mutation((of) => SaveResponseOutput)
  saveResponse(
    @AuthUser() authUser: User,
    @Args('input') saveResponseInput: SaveResponseInput,
  ): Promise<SaveResponseOutput> {
    return this.usersService.saveResponse(authUser, saveResponseInput);
  }
}
