import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { Public } from '../../infrastructure/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    // Set HttpOnly Secure cookie for refresh token
    if (result.refresh_token) {
      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: (result.refresh_expires_in ?? 7 * 24 * 3600) * 1000,
      });
    }

    // Only send access token and expires_in in body
    return res.json({
      access_token: result.access_token,
      expires_in: result.expires_in,
    });
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const cookie = req.cookies?.refresh_token as string | undefined;
    if (!cookie) {
      return res.status(401).json({ message: 'Missing refresh token' });
    }

    const result = await this.authService.refreshAccessToken(cookie);

    // Set rotated refresh token cookie if provided
    if (result.refresh_token) {
      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: (result.refresh_expires_in ?? 7 * 24 * 3600) * 1000,
      });
    }

    return res.json({
      access_token: result.access_token,
      expires_in: result.expires_in,
    });
  }

  @Public()
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const cookie = req.cookies?.refresh_token as string | undefined;

    if (cookie) {
      await this.authService.logout(cookie);
    }

    // Clear the refresh token cookie
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.json({ message: 'Logged out successfully' });
  }
}
