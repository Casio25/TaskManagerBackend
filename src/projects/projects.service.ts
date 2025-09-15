import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateProjectInviteDto } from './dto/create-project-invite.dto';
import { AcceptProjectInviteDto } from './dto/accept-project-invite.dto';
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
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async createProject(userId: number, dto: CreateProjectDto) {
    // validate optional group
    let groupId: number | undefined = undefined;
    if (dto.groupId !== undefined) {
      const group = await this.prisma.group.findUnique({ where: { id: dto.groupId } });
      if (!group) throw new NotFoundException('Group not found');
      if (group.adminId !== userId) {
        throw new ForbiddenException('Only group admin can create a project in this group');
      }
      groupId = dto.groupId;
    }

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        creatorId: userId,
        groupId,
        members: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
      },
    });
    return project;
  }

  async ensureProjectAdmin(projectId: number, userId: number) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.creatorId === userId) return project;
    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
      select: { role: true },
    });
    if (!membership || membership.role !== 'ADMIN') {
      throw new ForbiddenException('Only project admin allowed');
    }
    return project;
  }

  async createInvite(projectId: number, invitedById: number, dto: CreateProjectInviteDto) {
    await this.ensureProjectAdmin(projectId, invitedById);
    const expiresInDays = dto.expiresInDays ?? 7;
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    const secret = crypto.randomBytes(24).toString('hex');
    const tokenHash = await bcrypt.hash(secret, 10);
    const invite = await this.prisma.projectInvitation.create({
      data: {
        email: dto.email,
        projectId,
        invitedById,
        tokenHash,
        expiresAt,
      },
    });
    const token = makeToken(invite.id, secret);
    return { invite, token };
  }

  async acceptInvite(userId: number, userEmail: string, dto: AcceptProjectInviteDto) {
    const { id, secret } = parseToken(dto.token);
    const invite = await this.prisma.projectInvitation.findUnique({ where: { id } });
    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.status !== 'PENDING') throw new ForbiddenException('Invite is not active');
    if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
      throw new ForbiddenException('Invite expired');
    }
    if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new ForbiddenException('Invite email mismatch');
    }
    const ok = await bcrypt.compare(secret, invite.tokenHash);
    if (!ok) throw new ForbiddenException('Invalid token');

    // add to project as MEMBER
    await this.prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: invite.projectId, userId } },
      create: { projectId: invite.projectId, userId, role: 'MEMBER' },
      update: {},
    });

    // mark accepted
    const updated = await this.prisma.projectInvitation.update({
      where: { id: invite.id },
      data: { status: 'ACCEPTED', acceptedById: userId, acceptedAt: new Date() },
    });

    return { invitation: updated };
  }

  async myProjects(userId: number) {
    const memberships = await this.prisma.projectMember.findMany({
      where: { userId },
      include: { project: true },
    });
    const admin = memberships.filter((m) => m.role === 'ADMIN').map((m) => m.project);
    const member = memberships.filter((m) => m.role === 'MEMBER').map((m) => m.project);
    return { admin, member };
  }
}
