import {
  IsString,
  IsOptional,
  Length,
  IsEthereumAddress,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(2, 50)
  real_name!: string;

  @IsOptional()
  @IsString()
  @Length(3, 30)
  username?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  bio?: string;

  walletAddress?: string;
}
