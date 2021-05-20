import { Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // @Mutation((of) => CreateAccountOutput)
  // createAccount(
  //   @Args('input') createAccountInput: CreateAccountInput,
  // ): Promise<CreateAccountOutput> {
  //   return this.userService.createAccount(createAccountInput);
  // }

  // @Mutation((of) => LoginOutput)
  // login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
  //   return this.userService.login(loginInput);
  // }

  @Query((returns) => String)
  helloWorld(): string {
    return this.usersService.helloWorld();
  }
}
