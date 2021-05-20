import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/core.output.dto';

@InputType()
export class SaveResponseInput {
  @Field((type) => Int)
  questionNum: number;

  @Field((type) => Int)
  response: number;
}

@ObjectType()
export class SaveResponseOutput extends CoreOutput {}
