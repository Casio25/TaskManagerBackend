import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { CreateGroupInviteDto } from './dto/create-group-invite.dto';
import { AcceptGroupInviteDto } from './dto/accept-group-invite.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

function makeToken(inviteId: number, secret: string) {
  return `${inviteId}.${secret}`;
}

function parseToken(token: string): { id: number; secret: string } {
  const [idStr, secret] = token.split('.', 2);
  const id = Number(idStr);
  if (!id || !secret) throw new ForbiddenException('Invalid token');
  return { id, secret };
}

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async createGroup(userId: number, dto: CreateGroupDto) {
    const group = await this.prisma.group.create({
      data: {
        name: dto.name,
        adminId: userId,
        users: {
          create: { userId }, // add creator as member too
        },
      },
    });
    return group;
  }

  async ensureGroupAdmin(groupId: number, userId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group) throw new NotFoundException('Group not found');
    if (group.adminId !== userId)
      throw new ForbiddenException('Only group admin allowed');
    return group;
  }

  async createInvite(
    groupId: number,
    invitedById: number,
    dto: CreateGroupInviteDto,
  ) {
    await this.ensureGroupAdmin(groupId, invitedById);
    const expiresInDays = dto.expiresInDays ?? 7;
    const expiresAt = new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
    );
    const secret = crypto.randomBytes(24).toString('hex');
    const tokenHash = await bcrypt.hash(secret, 10);
    const invite = await this.prisma.groupInvitation.create({
      data: {
        email: dto.email,
        groupId,
        invitedById,
        tokenHash,
        expiresAt,
      },
    });
    const token = makeToken(invite.id, secret);
    return { invite, token };
  }

  async acceptInvite(
    userId: number,
    userEmail: string,
    dto: AcceptGroupInviteDto,
  ) {
    const { id, secret } = parseToken(dto.token);
    const invite = await this.prisma.groupInvitation.findUnique({
      where: { id },
    });
    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.status !== 'PENDING')
      throw new ForbiddenException('Invite is not active');
    if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
      throw new ForbiddenException('Invite expired');
    }
    if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new ForbiddenException('Invite email mismatch');
    }
    const ok = await bcrypt.compare(secret, invite.tokenHash);
    if (!ok) throw new ForbiddenException('Invalid token');

    // add to group
    await this.prisma.userGroup.upsert({
      where: { userId_groupId: { userId, groupId: invite.groupId } },
      create: { userId, groupId: invite.groupId },
      update: {},
    });

    // mark accepted
    const updated = await this.prisma.groupInvitation.update({
      where: { id: invite.id },
      data: {
        status: 'ACCEPTED',
        acceptedById: userId,
        acceptedAt: new Date(),
      },
    });

    return { invitation: updated };
  }
}
