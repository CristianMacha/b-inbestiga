import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CoreModule } from '../core/core.module';
import { UserModule } from '../modules/user/user.module';
import { AuthController } from './auth.controller';
import { AuthProvider } from './auth.provider';
import { AuthService } from './auth.service';
import { JwtStrategy } from './passport/jwt.strategy';
import {PersonModule} from "../modules/person/person.module";

@Module({
  imports: [AuthProvider, UserModule, PersonModule, CoreModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy],
})
export class AuthModule {
  constructor(private config: ConfigService) {}
}
