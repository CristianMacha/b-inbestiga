import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PersonService } from '../../modules/person/person.service';

import { IPayloadJwt } from '../../core/interfaces/payload-jwt.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private personService: PersonService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: IPayloadJwt) {
    const userDb = await this.personService.findOneByUser(payload.userId);
    if (!userDb) return null;

    return userDb;
  }
}
