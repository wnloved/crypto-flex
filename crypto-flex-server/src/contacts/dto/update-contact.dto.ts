import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateContactDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nickname!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  description!: string;
}
