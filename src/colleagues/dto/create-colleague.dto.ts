import { ArrayUnique, IsArray, IsEmail, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateColleagueDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  listIds?: number[];
}
