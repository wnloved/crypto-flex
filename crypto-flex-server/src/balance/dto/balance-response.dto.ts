import { TokenResponseDto } from '../../token/dto/token-response-dto';

export class BalanceResponseDto {
  id: number;
  walletAddress: string;
  token: TokenResponseDto;
  balance: string;
  updatedAt: Date;

  constructor(balance: any) {
    this.id = balance.id;
    this.walletAddress = balance.wallet?.wltAdress;
    this.token = new TokenResponseDto(balance.token);
    this.balance = balance;
    this.updatedAt = balance.updatedAt;
  }
}
