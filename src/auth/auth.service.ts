import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';

import {BcryptService} from '../core/helpers/bcrypt.service';
import {UserService} from '../modules/user/user.service';
import {Person} from 'src/modules/person/person.entity';
import {ResourceService} from "../modules/resource/resource.service";
import {PersonService} from "../modules/person/person.service";

@Injectable()
export class AuthService {
    constructor(
        private userServices: UserService,
        private bcryptServices: BcryptService,
        private jwtServices: JwtService,
        private resourceService: ResourceService,
        private personService: PersonService,
    ) {
    }

    async signing(email: string, password: string) {
        const userDb = await this.userServices.findByEmail(email);
        if (!userDb) throw new ForbiddenException();
        if (!userDb.active || userDb.deleted) {
            throw new ForbiddenException('No authorization')
        }

        const personDb = await this.personService.findOneByUser(userDb.id);
        const resources = await this.resourceService.findByRole(personDb.personRoles[0].id);

        const matchedPassword = await this.bcryptServices.compare(
            password,
            userDb.password,
        );

        if (!matchedPassword) throw new ForbiddenException();

        const token = await this.generateJwt(userDb.email, userDb.id);

        return {token, userDb, resources};
    }

    async refreshToken(personAuth: Person) {
        const userDb = await this.userServices.findOne(personAuth.user.id);
        if (!userDb) {
            throw new NotFoundException('User not found.');
        }

        const resources = await this.resourceService.findByRole(personAuth.personRoles[0].role.id);
        const token = await this.generateJwt(userDb.email, userDb.id);

        return {token, userDb, resources};
    }

    private async generateJwt(email: string, userId: number) {
        return await this.jwtServices.signAsync({email, userId});
    }
}
