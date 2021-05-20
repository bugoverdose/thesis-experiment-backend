import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/core.output.dto';
import { User } from '../entities/users.entity';

@InputType()
export class SeeProfileInput {
  @Field((type) => Int)
  userId: number;
}

@ObjectType()
export class SeeProfileOutput extends CoreOutput {
  @Field((type) => User, { nullable: true }) // 찾지 못한 경우 에러 예방
  user?: User;
}
