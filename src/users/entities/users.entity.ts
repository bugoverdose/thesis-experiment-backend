import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';

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
  accountType: AccountType;

  @Field((type) => Int)
  @Column()
  @IsInt()
  gender?: number; // 0: 남 // 1: 여

  @Field((type) => Int)
  @Column()
  @IsInt()
  age?: number; // 만 나이

  @Field((type) => Int)
  @Column()
  @IsInt()
  question1?: number;

  @Field((type) => Int)
  @Column()
  @IsInt()
  question2?: number;

  @Field((type) => Int)
  @Column()
  @IsInt()
  question3?: number;

  @Field((type) => Int)
  @Column()
  @IsInt()
  question4?: number;

  @Field((type) => String)
  @Column()
  @IsString()
  address?: string; // 기프티콘 제공용 연락처. 진짜로 선택사항.

  // TypeORM hooks
  @BeforeInsert() // 새로운 UserEntity를 Repo.create 후, Repo.save 직전에 자동실행.
  @BeforeUpdate() // 기존 UserEntity를 Repo.save로 업데이트시킬 때 직전에 자동실행.
  async hashPassword(): Promise<void> {
    if (this.password) {
      // UserEntity에 password 칼럼 데이터가 존재하는 경우에만 실행되도록. @Column({ select: false }) 때문에 password 칼럼 제외된 UserEntity 존재 가능.
      try {
        this.password = await bcrypt.hash(this.password, 10); // 인자1: 해슁할 데이터 / 인자2: saltOrRounds. 몇회.
        // DB에 저장할 UserEntity.password 데이터에 hash된 문자열 대입하여 전달.
      } catch (e) {
        throw new InternalServerErrorException();
      }
    }
  }

  // usersRepo.findOne로 찾아진 user가 해당 메서드 실행.
  async checkPassword(passwordInput: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(passwordInput, this.password); // 인자2: this.password. 해당 메서드를 실행한 UserEntity의 password 데이터. 비교 대상.
      return ok; // true 혹은 false. 인자1을 hash한 값이 인자2와 일치하는 경우에만 참.
    } catch (e) {
      throw new InternalServerErrorException();
    }
  } // 주의: await 없이 사용하면 true/false가 아니라 Promise로 return됨. 즉 항상 참.
}
