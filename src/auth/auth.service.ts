import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { BcryptService } from '../helpers/bcrypt.service';
import { UserService } from '../modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userServices: UserService,
    private bcryptServices: BcryptService,
    private jwtServices: JwtService,
  ) { }

  async signin(email: string, password: string) {
    try {
      const userDb = await this.userServices.findByEmail(email);
      if (!userDb) throw new ForbiddenException();

      const matchedPassword = await this.bcryptServices.decrypt(
        userDb.password,
        password,
      );
      if (!matchedPassword) throw new ForbiddenException();

      const token = await this.jwtServices.signAsync({
        email: userDb.email,
        userId: userDb.id,
        roleId: userDb.role.id,
      });

      return { token, userDb };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
