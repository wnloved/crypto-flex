import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getNonce(address: string, userId?: number) {
    const nonce = uuidv4();
    const nonceExpiry = new Date(Date.now() + 5 * 60 * 1000);

    if (userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new UnauthorizedException('User not found');

      const existingWallet = await this.prisma.wallet.findUnique({
        where: { wltAdress: address.toLowerCase() },
      });

      if (existingWallet && existingWallet.userId !== userId) {
        throw new UnauthorizedException(
          'Address already linked to another account',
        );
      }

      if (!existingWallet) {
        await this.prisma.wallet.create({
          data: {
            wltAdress: address.toLowerCase(),
            balance: 0,
            name: `Wallet ${address.slice(0, 6)}`,
            userId: user.id,
          },
        });
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { nonce, nonceExpiry },
      });

      return {
        nonce,
        message: this.createSignMessage(nonce),
      };
    }

    let user = await this.prisma.user.findFirst({
      where: {
        wallets: {
          some: {
            wltAdress: address.toLowerCase(),
          },
        },
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          real_name: `User_${address.slice(0, 6)}`,
          wallets: {
            create: {
              wltAdress: address.toLowerCase(),
              balance: 0,
              name: 'Main Wallet',
            },
          },
        },
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { nonce, nonceExpiry },
    });

    return {
      nonce,
      message: this.createSignMessage(nonce),
    };
  }
  async verifySignature(address: string, signature: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        wallets: {
          some: {
            wltAdress: address.toLowerCase(),
          },
        },
      },
      include: { wallets: true },
    });

    if (!user || !user.nonce || !user.nonceExpiry) {
      throw new UnauthorizedException('Nonce undetected!');
    }

    if (user.nonceExpiry < new Date()) {
      throw new UnauthorizedException('Nonce expired');
    }

    const message = this.createSignMessage(user.nonce);
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new UnauthorizedException('Invalid signature');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { nonce: null, nonceExpiry: null },
    });

    const payload = { sub: user.id };
    const token = this.jwtService.sign(payload);

    return {
      AccessToken: token,
      user: {
        id: user.id,
        nickname: user.real_name,
        wallets: user.wallets.map((w) => w.wltAdress),
      },
    };
  }
  private createSignMessage(nonce: string): string {
    return `Welcome to Crypto Wallet!\n\nSign this message to authenticate.\nNonce: ${nonce}`;
  }
}
