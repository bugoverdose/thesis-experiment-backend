import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/core.output.dto';
import { User } from '../entities/users.entity';

@InputType()
export class LocalLoginInput extends PickType(User, ['localId', 'password']) {}

@ObjectType()
export class LocalLoginOutput extends CoreOutput {
  @Field((type) => String, { nullable: true }) // token이 없는 경우, nullable:true가 아니면 graphQL 에러 발생.
  token?: string;
}
