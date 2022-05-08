import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { IPayloadJwt } from '../../core/interfaces/payload-jwt.interface';
import { UserService } from '../../modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userServices: UserService,
    private config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: IPayloadJwt) {
    const userDb = await this.userServices.findOneByEmailAndRole(
      payload.email,
      payload.roleId,
    );
    if (!userDb) return null;

    return userDb;
  }
}
