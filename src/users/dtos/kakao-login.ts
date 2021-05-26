import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/core.output.dto';

@InputType()
export class KakaoLoginInput {
  @Field((type) => String)
  code: string;
}

@ObjectType()
export class KakaoLoginOutput extends CoreOutput {
  @Field((type) => String, { nullable: true }) // token이 없는 경우, nullable:true가 아니면 graphQL 에러 발생.
  token?: string;
}
