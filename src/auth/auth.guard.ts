import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from 'src/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService, // JwtModule에서 JwtService를 export해줘서 주입 가능.
    private readonly usersService: UsersService, // UsersModule에서 UsersService를 export해서 주입 가능. // AuthModule에서 imports: [UsersModule]해줘야 주입 가능.
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const gqlContext = await GqlExecutionContext.create(context).getContext(); // gqlContext : AppModule의 GraphQLModule.forRoot의 context 메서드가 return한 객체 // ExecutionContext(= http req 혹은 ws connection)의 정보를 GraphQL context로 받기.
      const token = gqlContext.token; //사용자가 고의로 token으로 이상한 데이터 입력할 수도 있음 => toString()
      if (token) {
        const decoded = this.jwtService.verify(token.toString()); // decoded(해석된 토큰)은 string 혹은 object.
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          const { user } = await this.usersService.seeProfile({
            userId: decoded['id'], // SeeProfileInput 형식에 주의.
          }); // id에 해당하는 사용자 정보 찾기(User 엔티티)
          if (!user) {
            return false;
          }
          gqlContext['user'] = user; // @AuthUser() 데코레이터, resolver들에서 접근 가능해짐.
          return true;
        }
      }
      return false; // 토큰이 없거나, 토큰이 제대로 decode되지 못해 id 값이 없는 경우.
    } catch (e) {
      return false;
    }
  }
}
// 사용되는 Resolver들 쪽에서는 모듈에 imports: [UserModule] 필요. => App_Guard면 불필요?
