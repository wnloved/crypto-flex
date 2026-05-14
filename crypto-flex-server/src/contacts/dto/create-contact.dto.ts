import {
  IsString,
  IsOptional,
  IsEthereumAddress,
  MaxLength,
  MinLength,
  IsNumber,
} from 'class-validator';

export class CreateContactDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nickname!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  description!: string;

  @IsNumber()
  userId!: number;

  @IsNumber()
  contactId!: number;
}
