import { IsInt, IsString } from 'class-validator';
export class UpdateBalanceDto {
  @IsInt()
  walletId: number;

  @IsInt()
  tokenId: number;

  @IsString()
  balance: string;
}
