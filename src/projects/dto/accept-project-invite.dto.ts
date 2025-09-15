import { IsString } from 'class-validator';

export class AcceptProjectInviteDto {
  @IsString()
  token!: string; // format: <inviteId>.<secret>
}

