import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';

import {PersonService} from '../../modules/person/person.service';

import {IPayloadJwt} from '../../core/interfaces/payload-jwt.interface';
import {PersonRoleService} from "../../modules/person-role/person-role.service";
import {RoleService} from "../../modules/role/role.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private config: ConfigService,
        private personService: PersonService,
        private personRoleService: PersonRoleService,
        private roleService: RoleService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get('JWT_SECRET'),
        });
    }

    async validate(payload: IPayloadJwt) {
        const personDb = await this.personService.findOneByUser(payload.userId);
        if (!personDb) return null;

        const role = await this.roleService.findOne(payload.roleId);

        return {person: personDb, role};
    }
}
