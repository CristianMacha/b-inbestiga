import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {getConnection} from "typeorm";

import {BcryptService} from '../../core/helpers/bcrypt.service';
import {User} from './user.entity';
import {UserRepository} from './user.repository';
import {UserRegisterInterface} from "../../core/interfaces/user-register.interface";
import {NanoidService} from "../../core/helpers/nanoid.service";
import {Person} from "../person/person.entity";
import {PersonRole} from "../person-role/person-role.entity";
import {RoleService} from "../role/role.service";
import {ERole} from "../../core/enums/role.enum";

@Injectable()
export class UserService {
    constructor(
        private userRepository: UserRepository,
        private bcryptService: BcryptService,
        private bcryptServices: BcryptService,
        private nanoidService: NanoidService,
        private roleService: RoleService,
    ) {
    }

    async create(userRegister: UserRegisterInterface): Promise<User> {
        try {
            const connection = getConnection();
            const userCreated = await connection.transaction('SERIALIZABLE', async manager => {
                const passwordHash = await this.bcryptServices.encryptPassword(userRegister.password);
                const newUser = new User();
                newUser.email = userRegister.email;
                newUser.password = passwordHash;
                const userCreated = await manager.save(newUser);

                const personCode = await this.nanoidService.gUserCode();
                const newPerson = new Person();
                newPerson.fullname = userRegister.fullname;
                newPerson.code = personCode;
                newPerson.user = userCreated;
                newPerson.phone = userRegister.phone;
                const personCreated = await manager.save(newPerson);

                const roleStudent = await this.roleService.findOne(ERole.STUDENT);
                const newPersonRole = new PersonRole();
                newPersonRole.person = personCreated;
                newPersonRole.role = roleStudent;
                await manager.save(newPersonRole);

                return userCreated;
            });

            return userCreated;
        } catch (e) {
            throw new BadRequestException(e);
        }
    }

    async findOneByEmail(email: string, roleId: number): Promise<User> {
        const userDb = await this.userRepository.findOne({
            where: {email: email, active: true},
        });

        return userDb;
    }

    async findByEmail(email: string): Promise<User> {
        const userDb = await this.userRepository.findOne({
            where: {email: email, active: true},
        });

        return userDb;
    }

    async findOne(userId: number): Promise<User> {
        try {
            const userDb = await this.userRepository.findOne(userId);
            return userDb;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async updateActive(userId: number): Promise<User> {
        try {
            const userDb = await this.userRepository.findOne(userId);
            if (!userDb) {
                throw new NotFoundException('User not found.');
            }

            userDb.active = !userDb.active;
            const userUpdate = await this.userRepository.save(userDb);
            return userUpdate;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async updateDeleted(userId: number): Promise<User> {
        const userDb = await this.userRepository.findOne(userId);
        if (!userDb) {
            throw new NotFoundException('User not found')
        }

        userDb.deleted = true;
        const userDbUpdated = await this.userRepository.save(userDb);
        return userDbUpdated;
    }

    async updatePassword(password: string, newPassword: string, userId: number,): Promise<User> {
        try {
            const userDb = await this.userRepository.findOne(userId);
            if (!userDb) {
                throw new NotFoundException('User not found.');
            }

            const passwordHashed = await this.bcryptService.compare(
                password,
                userDb.password,
            );
            if (!passwordHashed) {
                throw new ForbiddenException();
            }

            const newPasswordHashed = await this.bcryptService.encryptPassword(
                newPassword,
            );
            userDb.password = newPasswordHashed;
            const userUpdate = await this.userRepository.save(userDb);
            return userUpdate;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async updateEmail(userId: number, newEmail: string): Promise<User> {
        try {
            const userDb = await this.userRepository.findOne(userId);
            if (!userDb) {
                throw new NotFoundException('User not found.');
            }

            userDb.email = newEmail;
            const userUpdated = await this.userRepository.save(userDb);
            return userUpdated;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
