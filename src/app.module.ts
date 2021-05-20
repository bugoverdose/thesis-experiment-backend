import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/users.entity';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi'; // TS 및 NestJS로 export 되어있지 않은 패키지 import 방법

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // app 어디서든 config 모듈에 접근 가능.
      envFilePath: '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(), // NODE_ENV의 값은 dev, production만 가능하도록 지정.
        DB_HOST: Joi.string().required(), // DB_HOST는 문자열이어야 하며 존재해야만 함.
        DB_PORT: Joi.string().required(), // Config Object Validation
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ssl: { rejectUnauthorized: false }, // Heroku 배포시 SSL 관련 에러 발생시 필요.
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT, // .env의 환경변수들은 전부 string 타입. +를 붙여서 number로
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD, // localhost로 접근할 때는 불필요.
      database: process.env.DB_NAME, // 해당 DB 인스턴스 내부에 새로 생성한 데이터베이스명.
      synchronize: true, // TypeORM이 DB에 연결될 때 Model들의 현재 상태에 맞추어 DB를 migrate하는 설정.
      logging: true, // DB에서 일어나는 일들을 콘솔에 표시해주는 설정.
      entities: [User], // 사용할 entity들 설정.
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      playground: process.env.NODE_ENV !== 'production', // 배포하지 않았을 때만 playground에 접근가능. 배포하면 false가 되어서 접근 불가.
    }),
    UsersModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
