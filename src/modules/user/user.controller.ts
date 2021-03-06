import { Body, Controller, Get, Param, Put } from '@nestjs/common';

import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('update/active/:id')
  async updateActive(@Param('id') userId: string): Promise<User> {
    return await this.userService.updateActive(+userId);
  }

  @Put('password/:id')
  async updatePassword(
    @Param('id') userId: string,
    @Body() body: { password: string; newPassword: string },
  ): Promise<User> {
    return await this.userService.updatePassword(
      body.password,
      body.newPassword,
      +userId,
    );
  }

  @Get(':id')
  async findOne(@Param('id') userId: string): Promise<User> {
    return await this.userService.findOne(+userId);
  }

  @Put('email/:id')
  async updateEmail(
    @Param('id') userId: string,
    @Body() body: { email: string },
  ): Promise<User> {
    return await this.userService.updateEmail(+userId, body.email);
  }
}
