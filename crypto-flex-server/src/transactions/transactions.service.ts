import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionResponseDto } from './dto/transaction-response.sto';
import { TokenService } from 'src/token/token.service';
@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {}
  async create(data: any) {
    console.log('📝 Создаём транзакцию:', data.hash);
    console.log(data);

    const existing = await this.prisma.transaction.findUnique({
      where: { hash: data.hash },
    });
    if (existing) return new TransactionResponseDto(existing);

    const chain = await this.prisma.chain.findUnique({
      where: { chainId: data.chainId },
    });
    if (!chain) throw new Error(`Chain ${data.chainId} not found`);

    let fromWallet = await this.prisma.wallet.findUnique({
      where: { wltAdress: data.fromAddress?.toLowerCase() },
    });

    let toWallet = await this.prisma.wallet.findUnique({
      where: { wltAdress: data.toAddress?.toLowerCase() },
    });

    const transaction = await this.prisma.transaction.create({
      data: {
        hash: data.hash,
        fromWalletId: fromWallet?.wltAdress.toLowerCase() || null,
        toWalletId: toWallet?.wltAdress.toLowerCase() || null,
        tokenId: data.tokenId,
        chainId: chain.id,
        value: data.amount,
        status: 'confirmed',
        blockNumber: data.blockNumber,
        confirmedAt: data.createdAt,
        createdAt: data.createdAt,
      },
      include: {
        fromWallet: true,
        toWallet: true,
        token: true,
        chain: true,
      },
    });

    console.log('✅ Транзакция создана:', transaction.id);
    return new TransactionResponseDto(transaction);
  }
  async getFromApi(address: string, chainId: number) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { wltAdress: address },
    });

    if (!wallet) {
      console.log('❌ Кошелёк не найден');
      return null;
    }

    const key = process.env.ETHERSCAN;
    const res = await fetch(
      `https://api.etherscan.io/v2/api?apikey=${key}&chainid=${chainId}&module=account&action=tokentx&address=${address}`,
      { method: 'GET' },
    );

    const json = await res.json();
    console.log(json);

    if (json.status !== '1') return [];

    for (let i = 0; i < json.result.length; i++) {
      const tx = json.result[i];

      let token = await this.prisma.token.findFirst({
        where: {
          address: tx.contractAddress,
          chainId: chainId,
        },
      });

      if (!token) {
        await this.tokenService.create({
          address: tx.contractAddress,
          chainId: chainId,
          symbol: tx.tokenSymbol,
          name: tx.tokenName,
          decimals: Number(tx.tokenDecimal),
        });
      }

      token = await this.prisma.token.findFirst({
        where: {
          address: tx.contractAddress,
          chainId: chainId,
        },
      });

      let fromWallet = await this.prisma.wallet.findFirst({
        where: { wltAdress: tx.from },
      });
      if (!fromWallet) {
        await this.prisma.wallet.create({
          data: {
            wltAdress: tx.from.toLowerCase(),
            balance: 0,
            name: 'Unknown Wallet',
          },
        });
      }
      let toWallet = await this.prisma.wallet.findFirst({
        where: { wltAdress: tx.to },
      });
      if (!toWallet) {
        await this.prisma.wallet.create({
          data: {
            wltAdress: tx.to.toLowerCase(),
            balance: 0,
            name: 'Unknown Wallet',
          },
        });
      }
      console.log((tx.value / 10) * Number(tx.tokenDecimal));
      await this.create({
        hash: tx.hash,
        tokenId: token?.id,
        chainId: chainId,
        amount: (
          Number(tx.value) / Math.pow(10, Number(tx.tokenDecimal))
        ).toString(),
        fromAddress: tx.from,
        toAddress: tx.to,
        blockNumber: Number(tx.blockNumber),
        createdAt: new Date(tx.timeStamp * 1000).toISOString(),
      });
    }
  }
  async getAll(address: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        OR: [{ fromWalletId: address }, { toWalletId: address }],
      },
      include: {
        token: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((tx) => {
      return {
        id: tx.id,
        hash: tx.hash,
        fromWalletId: tx.fromWalletId || 'Unknown',
        toWalletId: tx.toWalletId || 'Unknown',
        value: tx.value,
        token: tx.token?.symbol,
        status: tx.status,
        createdAt: tx.createdAt,
        blockNumber: tx.blockNumber,
      };
    });
  }
}
