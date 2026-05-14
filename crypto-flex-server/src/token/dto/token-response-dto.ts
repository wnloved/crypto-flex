export class TokenResponseDto {
  id: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
  chainId: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(token: any) {
    this.id = token.id;
    this.address = token.address;
    this.name = token.name;
    this.symbol = token.symbol;
    this.decimals = token.decimals;
    this.logo = token.logo;
    this.createdAt = token.createdAt;
    this.updatedAt = token.updatedAt;
  }
}
