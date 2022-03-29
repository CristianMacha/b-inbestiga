import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserModule } from '../modules/user/user.module';
import { AuthController } from './auth.controller';
import { AuthProvider } from './auth.provider';
import { AuthService } from './auth.service';
import { JwtStrategy } from './passport/jwt.strategy';

@Module({
  imports: [AuthProvider, UserModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy],
})
export class AuthModule {
  constructor(private config: ConfigService) {}
}
