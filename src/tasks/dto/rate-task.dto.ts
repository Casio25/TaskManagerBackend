import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class RateTaskDto {
  @IsInt()
  @Min(1)
  @Max(10)
  punctuality!: number;

  @IsInt()
  @Min(1)
  @Max(10)
  teamwork!: number;

  @IsInt()
  @Min(1)
  @Max(10)
  quality!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comments?: string;
}
