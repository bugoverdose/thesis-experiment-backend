import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/core.output.dto';

@InputType()
export class SaveUserInfoResponseInput {
  @Field((type) => String)
  target: string;

  @Field((type) => Int)
  response: number;
}

@ObjectType()
export class SaveUserInfoResponseOutput extends CoreOutput {}
