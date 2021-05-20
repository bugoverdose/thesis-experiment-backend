import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/core.entity';
import { Column, Entity } from 'typeorm';

export enum AccountType {
  Local = 'Local',
  Kakao = 'Kakao', // TypeORM용 필드타입.
}

registerEnumType(AccountType, { name: 'AccountType' }); // GraphQL용 필드타입.

@Entity()
@InputType('UserInputType', { isAbstract: true }) // MappedTypes를 통해 해당 GraphQL 엔티티로 dto 생성하기 위해 필요. isAbstract:  GraphQL 스키마에서 @InputType의 엔티티 생성 방지.
@ObjectType() // GraphQL 스키마에 @ObjectType만 생성
export class User extends CoreEntity {
  // kakaoId?: string;

  @Field((type) => String) // GraphQL
  @Column()
  @IsString() // class-validator
  localId?: string;

  @Field((type) => String)
  @Column({ select: false }) // Repo.findOne에서 누락 설정. 접근하려면 select 옵션 필요. // 해당 칼럼만 제외된 UserEntity 객체를 Repo.save 메서드에 전달 가능해짐.
  @IsString()
  password?: string; // this.usersRepo.findOne( { email }, { select: ['id', 'password'] },) // 해당 칼럼의 데이터들만 가져오기.

  @Field((type) => AccountType)
  @Column({ type: 'enum', enum: AccountType })
  @IsEnum(AccountType)
  role: AccountType;
}
