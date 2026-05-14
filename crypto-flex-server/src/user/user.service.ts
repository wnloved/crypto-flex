import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserResponseDto } from './dto/user-response.dto';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
  ) {}
  async update(
    userId: number,
    userDto: UpdateUserDto,
    file: Express.Multer.File,
  ) {
    if (file) {
      const bucket = await this.s3.listBuckets();
      const filePath = await this.s3.uploadFile(
        bucket![0].Name!,
        `avatar/${userDto.username!}.jpg`,
        file.buffer,
      );
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { ...userDto, avatar: filePath },
        include: { wallets: true },
      });
      return new UserResponseDto(user);
    } else if (file == null) {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { ...userDto },
        include: { wallets: true },
      });
    }
  }
  async getOne(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    return new UserResponseDto(user);
  }
  async getAvatar(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    return user?.avatar;
  }
  async getWallets(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallets: true },
    });
    return (user?.wallets || []).map((w) => ({
      ...w,
      balance: Number(w.balance),
    }));
  }
}
