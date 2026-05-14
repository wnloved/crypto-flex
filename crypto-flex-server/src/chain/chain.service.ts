import { Injectable } from '@nestjs/common';
import { CreateChainDto } from './dto/create-chain.dto';
import { UpdateChainDto } from './dto/update-chain.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChainService {
  constructor(private prisma: PrismaService) {}
  async upsert(createChainDto: CreateChainDto) {
    const chain = await this.prisma.chain.upsert({
      where: {
        chainId: createChainDto.chainId,
      },
      update: {
        name: createChainDto.name,
        chainId: createChainDto.chainId,
        symbol: createChainDto.symbol,
        testnet: createChainDto.testnet,
      },
      create: {
        chainId: createChainDto.chainId,
        name: createChainDto.name,
        symbol: createChainDto.symbol,
        testnet: createChainDto.testnet || false,
      },
    });

    return chain;
  }
  async getOne(chainId: number) {
    return this.prisma.chain.findUnique({
      where: { chainId: chainId },
    });
  }
  async getAll() {
    return this.prisma.chain.findMany();
  }
}
