import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/core.output.dto';

@InputType()
export class LocalScreeningInput {
  @Field((type) => String)
  response: string;
}

@ObjectType()
export class LocalScreeningOutput extends CoreOutput {}
