import { BadRequestException, Injectable } from '@nestjs/common';

import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

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
}
