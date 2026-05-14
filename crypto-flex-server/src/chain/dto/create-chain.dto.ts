import { IsString, IsInt, IsUrl, IsBoolean, IsOptional } from 'class-validator';

export class CreateChainDto {
  @IsInt()
  chainId: number;

  @IsString()
  name: string;

  @IsString()
  symbol: string;

  @IsUrl()
  rpcUrl: string;

  @IsOptional()
  @IsUrl()
  explorerUrl?: string;

  @IsOptional()
  @IsBoolean()
  testnet?: boolean;
}
