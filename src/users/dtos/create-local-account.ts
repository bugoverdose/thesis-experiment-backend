import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/core.output.dto';
import { User } from '../entities/users.entity';

@InputType()
export class CreateLocalAccountInput extends PickType(User, [
  'localId',
  'password',
]) {}

@ObjectType()
export class CreateLocalAccountOutput extends CoreOutput {
  @Field((type) => Int, { nullable: true })
  id?: number;
}
