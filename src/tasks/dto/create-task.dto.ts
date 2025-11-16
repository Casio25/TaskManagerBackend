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

export class CreateTaskDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  projectId!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  assignedToId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  assignedGroupId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  parentTaskId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  themeId?: number;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}
