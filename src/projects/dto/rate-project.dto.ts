import { RateTaskDto } from '../../tasks/dto/rate-task.dto';
import { IsInt, Min } from 'class-validator';

export class RateProjectDto extends RateTaskDto {
  @IsInt()
  @Min(1)
  userId!: number;
}
