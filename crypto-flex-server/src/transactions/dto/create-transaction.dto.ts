import {
  IsString,
  IsOptional,
  Length,
  IsEthereumAddress,
  IsInt,
  Max,
  Min,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export class CreateTransactionDto {
  @IsString()
  hash!: string;

  @IsInt()
  chainId!: number;
  @IsOptional()
  @IsString()
  fromWalletId?: string | null;

  @IsOptional()
  @IsString()
  toWalletId?: string | null;

  @IsOptional()
  @IsInt()
  tokenId?: number;

  @IsString()
  value!: string;

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus = TransactionStatus.PENDING;

  @IsOptional()
  @IsInt()
  blockNumber?: number;

  @IsOptional()
  @IsInt()
  userId?: number;
}
