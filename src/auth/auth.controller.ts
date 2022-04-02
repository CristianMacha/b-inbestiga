import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authServices: AuthService) {}

  @Post('signin')
  async signin(@Body() data: { email: string; password: string }) {
    return await this.authServices.signin(data.email, data.password);
  }
}
