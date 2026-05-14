import { Injectable } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { TokenService } from 'src/token/token.service';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private tokenService: TokenService,
  ) {}
  async getWallet(address: string) {
    const wallet = this.prisma.wallet.findUnique({
      where: { wltAdress: address },
    });
    return wallet;
  }
  async getNativeBalance(address: string, chain: number) {
    const cacheKey = `Native:${address}:balance`;
    console.log(await this.redis.get(cacheKey));
    if ((await this.redis.get(cacheKey)) == null) {
      const key = process.env.ETHERSCAN;
      const wallet = await this.getWallet(address);
      const res = await fetch(
        `https://api.etherscan.io/v2/api?apikey=${key}&chainid=${chain}&module=account&action=balance&address=${address}`,
        {
          method: 'GET',
        },
      );
      const json = await res.json();
      const redis = this.redis.set(cacheKey, json.result);
      console.log('Uploaded to native to redis');
      return json.result;
    }
    return this.redis.get(cacheKey);
  }
  async getTokensData(address: string, chainId: string) {
    const tokens = await this.tokenService.getAllTracked(
      address,
      parseInt(chainId, 16),
    );
    const data: any[] = [];
    for (let i = 0; i < tokens.length; i++) {
      // const cacheKey = `balance:${address}:${tt.token.address}`
      let oneBalance = await this.redis.get(
        `balance:${address}:${tokens[i].address}`,
      );
      console.log(`balance:${address}:${tokens[i].address}`);
      data.push({ ...tokens[i], balance: oneBalance! });
      console.log(data);
    }
    return data;
  }
}
