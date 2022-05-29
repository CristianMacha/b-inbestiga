import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { BcryptService } from '../../core/helpers/bcrypt.service';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private bcryptService: BcryptService,
  ) { }

  async findOneByEmail(email: string, roleId: number): Promise<User> {
    const userDb = await this.userRepository.findOne({
      where: { email: email, active: true },
    });

    return userDb;
  }

  async findByEmail(email: string): Promise<User> {
    const userDb = await this.userRepository.findOne({
      where: { email: email, active: true },
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
      if (!userDb) { throw new NotFoundException('User not found.'); }

      userDb.active = !userDb.active;
      const userUpdate = await this.userRepository.save(userDb);
      return userUpdate;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updatePassword(password: string, newPassword: string, userId: number): Promise<User> {
    try {
      const userDb = await this.userRepository.findOne(userId);
      if (!userDb) { throw new NotFoundException('User not found.'); }

      const passwordHashed = await this.bcryptService.compare(password, userDb.password);
      if (!passwordHashed) { throw new ForbiddenException(); }

      const newPasswordHashed = await this.bcryptService.encryptPassword(newPassword);
      userDb.password = newPasswordHashed;
      const userUpdate = await this.userRepository.save(userDb);
      return userUpdate;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
