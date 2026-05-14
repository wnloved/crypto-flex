import { Injectable } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenResponseDto } from './dto/token-response-dto';
import { ethers } from 'ethers';
import { BalanceService } from 'src/balance/balance.service';
@Injectable()
export class TokenService {
  constructor(
    private prisma: PrismaService,
    private balanceService: BalanceService,
  ) {}
  async create(createTokenDto: CreateTokenDto) {
    const token = await this.prisma.token.create({
      data: {
        ...createTokenDto,
        logo: `https://img.logokit.com/crypto/${createTokenDto.symbol.toUpperCase()}?token=${process.env.LOGOKIT}`,
        price: await this.getTokenPrice(createTokenDto.symbol.toUpperCase()),
      },
    });
    return new TokenResponseDto(token);
  }
  async addToTracked(address: string, tokenAddress: string, chainId: number) {
    console.log('Работает с этим ', tokenAddress, chainId);
    const wallet = await this.prisma.wallet.findUnique({
      where: { wltAdress: address },
    });

    if (!wallet) throw new Error('Wallet not found');
    const chain = await this.prisma.chain.findUnique({
      where: { chainId: chainId },
    });
    if (!chain) throw new Error(`Chain ${chainId} not found`);
    let token = await this.prisma.token.findUnique({
      where: {
        address_chainId: {
          address: tokenAddress,
          chainId: chain.chainId,
        },
      },
    });
    const tracked = await this.prisma.trackedToken.create({
      data: {
        walletId: wallet.id,
        tokenId: token!.id,
      },
      include: { token: true },
    });
    const redis = await this.balanceService.getBalanceFromApi(
      chain.chainId,
      wallet.wltAdress,
    );
    return tracked;
  }
  async getAll() {
    const res = await this.prisma.token.findMany({
      include: {
        chain: true,
      },
    });
    return res;
  }
  async getOne(address: string, chainId: number) {
    console.log(address, chainId);
    const token = await this.prisma.token.findUnique({
      where: {
        address_chainId: {
          address: address,
          chainId,
        },
      },
      include: {
        chain: true,
      },
    });
    console.log(token);
    return token;
  }
  async getAllTracked(address: string, chainId: number) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { wltAdress: address },
    });

    if (!wallet) return [];
    const tokens = await this.prisma.trackedToken.findMany({
      where: {
        walletId: wallet.id,
        ...(chainId && { token: { chainId: chainId } }),
      },
      include: { token: true },
    });
    return tokens.map((tt) => ({
      id: tt.token.id,
      address: tt.token.address,
      symbol: tt.token.symbol,
      name: tt.token.name,
      decimals: tt.token.decimals,
      logo: tt.token.logo,
      chainId: tt.token.chainId,
      price: tt.token.price,
    }));
  }

  private async getTokenPrice(symbol: string): Promise<number> {
    try {
      const cleanSymbol = symbol
        .toUpperCase()
        .replace('SEPOLIA', '')
        .replace('TEST', '');

      const stableCoins = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'USDP'];
      if (stableCoins.includes(cleanSymbol)) {
        return 1;
      }

      const pairs = [
        `${cleanSymbol}USDT`,
        `${cleanSymbol}BUSD`,
        `USDT${cleanSymbol}`,
        `BUSD${cleanSymbol}`,
      ];

      for (const pair of pairs) {
        try {
          const response = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${pair}`,
            { signal: AbortSignal.timeout(3000) },
          );

          if (response.ok) {
            const data = await response.json();
            const price = parseFloat(data.price);
            if (price > 0) {
              return price;
            }
          }
        } catch (e) {}
      }

      return 0;
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      return 0;
    }
  }
}
