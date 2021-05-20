import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from './jwt.interface';
import { JwtService } from './jwt.service';

@Global() // 앱 어디서나 JwtService 사용 가능
@Module({
  providers: [JwtService],
})
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      providers: [{ provide: CONFIG_OPTIONS, useValue: options }, JwtService],
      exports: [JwtService],
    };
  }
} // AppModule에서 JwtModule.forRoot()해줘야 동적모듈로 활용 가능해짐.
