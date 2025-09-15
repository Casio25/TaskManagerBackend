import { IsEmail, IsInt, IsOptional, Max, Min } from 'class-validator';

export class CreateProjectInviteDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  expiresInDays?: number; // default 7
}

