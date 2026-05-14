import { Injectable } from '@nestjs/common';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ethers, Wallet } from 'ethers';
import { BalanceResponseDto } from './dto/balance-response.dto';
import { RedisService } from 'src/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class BalanceService {
  constructor(
    private redis: RedisService,
    private prisma: PrismaService,
  ) {}
  async getBalance(address: string) {
    const cacheKey = `balance:${address}:native`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  }
  async getTokenBalance(address: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { wltAdress: address },
    });

    if (!wallet) return null;

    const trackedTokens = await this.prisma.trackedToken.findMany({
      where: { walletId: wallet.id },
      include: { token: true },
    });

    const balances: any[] = [];

    for (let i = 0; i < trackedTokens.length; i++) {
      const tt = trackedTokens[i];
      const cacheKey = `balance:${address}:${tt.token.address}`;
      let balance = await this.redis.get(cacheKey);
      console.log(cacheKey, balance);
      if (balance) {
        balances.push(JSON.parse(balance));
      }
    }
    return balances;
  }
  async getTestBalanceFromChain(chainId: number, address: string) {
    const res = await fetch(
      `https://api.etherscan.io/v2/api?apikey=${process.env.ETHERSCAN}&chainid=${chainId}&module=account&action=balance&address=${address}`,
      {
        method: 'GET',
      },
    );
    const json = await res.json();

    return json.result;
  }

  async getBalanceFromApi(chainId: number, address: string) {
    console.log(chainId, address);
    const wallet = await this.prisma.wallet.findUnique({
      where: { wltAdress: address },
    });
    if (!wallet) return null;

    const trackedTokens = await this.prisma.trackedToken.findMany({
      where: { walletId: wallet.id },
      include: { token: true },
    });
    const key = process.env.ETHERSCAN;
    for (let i = 0; i < trackedTokens.length; i++) {
      const tt = trackedTokens[i];
      if (tt.token.chainId != chainId) continue;
      await this.delay(2000);

      try {
        const cacheKey = `balance:${address}:${tt.token.address}`;
        console.log(cacheKey);
        const res = await fetch(
          `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=tokenbalance&contractaddress=${tt.token.address}&address=${address}&tag=latest&apikey=${key}`,
        );
        const oneBalance = await res.json();
        const result = oneBalance.result / (10 * tt.token.decimals);
        await this.redis.set(cacheKey, JSON.stringify(result));
        console.log(`✅ Обновлён ${tt.token.symbol}: ${result}`);
      } catch (error) {
        console.log(`❌ Ошибка при обновлении ${tt.token.symbol}: ${error}`);
      }
    }
  }
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
