import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChainService } from './chain/chain.service';
import { TokenService } from './token/token.service';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(
    private chainService: ChainService,
    private tokenService: TokenService,
    private prisma: PrismaService,
  ) {}
  async seedAll(address) {
    console.log('🔥 Seeding all data...');

    const chains = [
      {
        chainId: 1,
        name: 'Ethereum',
        symbol: 'ETH',
        rpcUrl: 'https://ethereum.publicnode.com',
        testnet: false,
      },
      {
        chainId: 11155111,
        name: 'Sepolia',
        symbol: 'SepoliaETH',
        rpcUrl: 'https://ethereum-sepolia.publicnode.com',
        testnet: true,
      },
      {
        chainId: 137,
        name: 'Polygon',
        symbol: 'MATIC',
        rpcUrl: 'https://polygon-bor.publicnode.com',
        testnet: false,
      },
    ];

    const tokens = [
      {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        chainId: 1,
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
      },
      {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        chainId: 1,
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
      },
      {
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        chainId: 1,
        symbol: 'DAI',
        name: 'Dai',
        decimals: 18,
      },
      {
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        chainId: 1,
        symbol: 'WBTC',
        name: 'Wrapped Bitcoin',
        decimals: 8,
      },

      {
        address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        chainId: 11155111,
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
      },

      {
        address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        chainId: 137,
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
      },
      {
        address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        chainId: 137,
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
      },
    ];

    console.log('🌐 Creating chains...');
    for (const chain of chains) {
      try {
        await this.chainService.upsert(chain);
        console.log(`  ✅ ${chain.name}`);
      } catch (e) {
        console.log(`  ❌ ${chain.name}`);
      }
    }

    console.log('\n💰 Creating tokens...');
    for (const token of tokens) {
      try {
        await this.tokenService.create(token);
        console.log(`  ✅ ${token.symbol} on chain ${token.chainId}`);
      } catch (e) {
        console.log(`  ❌ ${token.symbol}`);
      }
    }

    if (address) {
      console.log('\n🔗 Adding tokens to tracked...');

      const allTokens = await this.prisma.token.findMany();

      for (const token of allTokens) {
        try {
          await this.tokenService.addToTracked(
            address,
            token.address,
            token.chainId,
          );
          console.log(`  ✅ Tracked ${token.symbol}`);
        } catch (e) {
          console.log(`  ❌ Failed to track ${token.symbol}`);
        }
      }
    }

    console.log('\n🎉 Seeding complete!');
  }
}
