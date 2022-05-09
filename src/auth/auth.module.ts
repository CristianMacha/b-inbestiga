import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PersonModule } from 'src/modules/person/person.module';

import { CoreModule } from '../core/core.module';
import { UserModule } from '../modules/user/user.module';
import { AuthController } from './auth.controller';
import { AuthProvider } from './auth.provider';
import { AuthService } from './auth.service';
import { JwtStrategy } from './passport/jwt.strategy';

@Module({
  imports: [
    AuthProvider,
    UserModule,
    PersonModule,
    CoreModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy],
})
export class AuthModule {
  constructor(private config: ConfigService) {}
}
