import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

export const AuthProvider: DynamicModule = JwtModule.registerAsync({
  inject: [ConfigService],
  async useFactory(config: ConfigService) {
    const register: JwtModuleOptions = {
      secret: config.get('JWT_SECRET'),
      signOptions: { expiresIn: '1d' },
    };

    return register;
  },
});
