import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/core.output.dto';

@InputType()
export class SaveAddressResponseInput {
  @Field((type) => String)
  response: string;
}

@ObjectType()
export class SaveAddressResponseOutput extends CoreOutput {}
