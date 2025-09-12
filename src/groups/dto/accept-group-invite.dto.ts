import { IsString } from 'class-validator';

export class AcceptGroupInviteDto {
  @IsString()
  token!: string; // format: <inviteId>.<secret>
}

