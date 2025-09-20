import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateListDto {
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  name!: string;
}
