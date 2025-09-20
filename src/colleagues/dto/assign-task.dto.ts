import { IsInt, Min } from 'class-validator';

export class AssignTaskDto {
  @IsInt()
  @Min(1)
  taskId!: number;
}
