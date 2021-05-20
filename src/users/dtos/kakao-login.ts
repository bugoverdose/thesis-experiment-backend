import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/core.output.dto';

@InputType()
export class KakaoLoginInput {
  @Field((type) => String)
  code: string;
}

@ObjectType()
export class KakaoLoginOutput extends CoreOutput {
  @Field((type) => String)
  token?: string;
}
