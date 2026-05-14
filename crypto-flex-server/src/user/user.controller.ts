import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtStrategy } from 'src/auth/jwt/jwt.strategy';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('update')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Request() req,
    @Body() UpdateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.update(req.user.id, UpdateUserDto, file);
  }
  @Get('info/:id')
  getOne(@Param('id') id: string) {
    return this.userService.getOne(parseInt(id));
  }
  @Get('avatar')
  @UseGuards(AuthGuard)
  getAvatar(@Request() req) {
    return this.userService.getAvatar(req.user.id);
  }
  @Get('wallets')
  @UseGuards(AuthGuard)
  async getWallets(@Request() req) {
    return this.userService.getWallets(req.user.id);
  }
  @Get('wallets/:userId')
  async getUserWallets(@Param('userId') userId: string) {
    return this.userService.getWallets(parseInt(userId));
  }
}
