import { ArrayMinSize, IsArray, IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ProjectTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  tags!: string[];

  @IsDateString()
  deadline!: string;
}
