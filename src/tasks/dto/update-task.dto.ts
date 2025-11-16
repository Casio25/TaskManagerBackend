import { TaskStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  deadline?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  assignedToId?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  assignedGroupId?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  themeId?: number | null;
}
