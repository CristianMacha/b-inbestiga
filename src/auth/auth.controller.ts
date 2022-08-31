import {Body, Controller, Get, Param, Post, Req, UseGuards} from '@nestjs/common';

import {JwtAuthGuard} from '../core/guards/jwt-auth.guard';
import {AuthService} from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authServices: AuthService) {
    }

    @Post('signing')
    async signing(@Body() data: { email: string; password: string }) {
        return await this.authServices.signing(data.email, data.password);
    }

    @UseGuards(JwtAuthGuard)
    @Get('refresh-token/role/:id')
    async refreshToken(@Param('id') roleId: string, @Req() req) {
        return await this.authServices.refreshToken(req.user.person, +roleId);
    }
}
