import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private prisma: PrismaService,
  ) {}

  @Post('seed/:address')
  async seed(@Param('address') address: string) {
    await this.appService.seedAll(address);
    return { message: 'Seeding complete' };
  }
  @Get('search')
  async globalSearch(@Query('q') q: string) {
    if (!q || q.length < 2) return [];

    const [users, tokens] = await Promise.all([
      this.prisma.user.findMany({
        where: { username: { contains: q, mode: 'insensitive' } },
        select: { id: true, username: true },
        take: 5,
      }),

      this.prisma.token.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { symbol: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { address: true, name: true, symbol: true, chainId: true },
        take: 5,
      }),
    ]);

    return [
      ...users.map((u) => ({ type: 'user', id: u.id, username: u.username })),
      ...tokens.map((t) => ({
        type: 'token',
        address: t.address,
        name: t.name,
        symbol: t.symbol,
        chainId: `0x${t.chainId.toString(16)}`,
      })),
    ];
  }
}
