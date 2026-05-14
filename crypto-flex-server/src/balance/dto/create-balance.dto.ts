import { IsInt, IsString } from 'class-validator';
export class CreateBalanceDto {
  @IsInt()
  walletId: number;

  @IsInt()
  tokenId: number;

  @IsString()
  balance: string;
}
