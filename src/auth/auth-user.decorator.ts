import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(context).getContext(); // ExecutionContext(= http req 혹은 ws connection)의 정보를 GraphQL context로 받기.
    const user = gqlContext['user']; // AuthGuard에서 graphQL context에 대입한 user 정보.
    return user; // 토큰을 통해 해석된 현재 로그인된 사용자 정보. UserEntity
  },
); // 매개변수 데코레이터. 자동으로 인자에 user를 대입해줌.
