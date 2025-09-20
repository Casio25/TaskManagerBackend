import { IsInt, Min } from 'class-validator';

export class AddToListDto {
  @IsInt()
  @Min(1)
  colleagueId!: number;
}
