import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('nonce')
  async getNonce(
    @Body('address') address: string,
    @Body('userId') userId?: number,
  ) {
    return this.authService.getNonce(address, userId);
  }
  @Post('verify')
  async verify(
    @Body('address') address: string,
    @Body('signature') signature: string,
  ) {
    return this.authService.verifySignature(address, signature);
  }
}
