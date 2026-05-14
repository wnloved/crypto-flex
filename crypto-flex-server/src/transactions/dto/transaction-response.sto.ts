import { ethers } from 'ethers';

export class TransactionResponseDto {
  id: number;
  hash: string;
  fromAddress: string;
  toAddress: string;
  tokenSymbol: string;
  tokenAddress?: string;
  value: string;
  formattedValue: string;
  status: string;
  blockNumber?: number;
  createdAt: Date;
  confirmedAt?: Date;
  direction?: 'incoming' | 'outgoing';

  constructor(transaction: any, currentUserAddress?: string) {
    this.id = transaction.id;
    this.hash = transaction.hash;
    this.fromAddress = transaction.fromWallet?.wltAdress || '';
    this.toAddress = transaction.toWallet?.wltAdress || '';
    this.tokenSymbol =
      transaction.token?.symbol || transaction.chain?.symbol || 'ETH';
    this.tokenAddress = transaction.token?.address;

    const rawValue = transaction.value || '0';
    this.value = rawValue;

    try {
      if (transaction.token) {
        this.formattedValue = ethers.formatUnits(
          BigInt(rawValue),
          transaction.token.decimals,
        );
      } else {
        this.formattedValue = ethers.formatEther(BigInt(rawValue));
      }
    } catch (error) {
      console.error('Ошибка форматирования value:', rawValue);
      this.formattedValue = '0';
    }

    this.status = transaction.status;
    this.blockNumber = transaction.blockNumber || undefined;
    this.createdAt = transaction.createdAt;
    this.confirmedAt = transaction.confirmedAt || undefined;

    if (currentUserAddress) {
      if (this.fromAddress.toLowerCase() === currentUserAddress.toLowerCase()) {
        this.direction = 'outgoing';
      } else if (
        this.toAddress.toLowerCase() === currentUserAddress.toLowerCase()
      ) {
        this.direction = 'incoming';
      }
    }
  }
}
