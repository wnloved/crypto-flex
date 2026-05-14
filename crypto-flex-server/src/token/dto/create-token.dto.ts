import {
  IsString,
  IsOptional,
  Length,
  IsEthereumAddress,
  IsInt,
  Max,
  Min,
  IsNumber,
} from 'class-validator';
export class CreateTokenDto {
  @IsString()
  @IsEthereumAddress()
  @Length(42, 42)
  address!: string;

  @IsString()
  @Length(3, 30)
  name!: string;

  @IsString()
  @Length(1, 20)
  symbol!: string;

  @IsInt()
  @Min(0)
  @Max(20)
  decimals!: number;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  logo?: string;

  @IsInt()
  @Min(1)
  chainId!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  price?: number;
}
