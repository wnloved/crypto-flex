import {
  IsString,
  IsOptional,
  Length,
  IsEthereumAddress,
  IsInt,
} from 'class-validator';
export class UpdateTokenDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(3, 30)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(3, 200)
  symbol?: string;

  @IsOptional()
  @IsInt()
  @Length(3, 200)
  decimals?: number;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  logo?: string;
}
