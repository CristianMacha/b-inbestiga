import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async findOneByEmailAndRole(email: string, roleId: number): Promise<User> {
    const userDb = await this.userRepository.findOne({
      relations: ['role'],
      where: { email: email, role: { id: roleId }, active: true },
    });

    return userDb;
  }
}
