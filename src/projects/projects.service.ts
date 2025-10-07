import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateProjectInviteDto } from './dto/create-project-invite.dto';
import { AcceptProjectInviteDto } from './dto/accept-project-invite.dto';
import { Prisma, ProjectStatus } from '@prisma/client';
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
  const { tasks, deadline, groupId: requestedGroupId, name, description, color: colorInput } = dto;
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new BadRequestException('Project name is required');
  }
  const trimmedDescription = description?.trim() || undefined;
  const color = (colorInput?.trim() || '#2563EB').toUpperCase();

  let groupId: number | undefined;
  if (requestedGroupId !== undefined) {
    const group = await this.prisma.group.findUnique({ where: { id: requestedGroupId } });
    if (!group) throw new NotFoundException('Group not found');
    if (group.adminId !== userId) {
      throw new ForbiddenException('Only group admin can create a project in this group');
    }
    groupId = requestedGroupId;
  }

  const projectDeadline = new Date(deadline);
  if (Number.isNaN(projectDeadline.getTime())) {
    throw new BadRequestException('Invalid deadline');
  }

  const projectRecord = await this.prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name: trimmedName,
        description: trimmedDescription,
        creatorId: userId,
        groupId,
        deadline: projectDeadline,
        color,
        members: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
      },
    });

    for (const taskDto of tasks) {
      const taskDeadline = new Date(taskDto.deadline);
      if (Number.isNaN(taskDeadline.getTime())) {
        throw new BadRequestException(`Invalid task deadline for "${taskDto.title}"`);
      }
      if (taskDeadline.getTime() > projectDeadline.getTime()) {
        throw new BadRequestException(
          `Task deadline cannot be later than project deadline for "${taskDto.title}"`,
        );
      }

      const trimmedTitle = taskDto.title.trim();
      if (!trimmedTitle) {
        throw new BadRequestException('Task title is required');
      }
      const normalizedDescription = taskDto.description?.trim() || undefined;

      const task = await tx.task.create({
        data: {
          title: trimmedTitle,
          description: normalizedDescription,
          projectId: project.id,
          deadline: taskDeadline,
        },
      });

      const uniqueTags = Array.from(
        new Set(taskDto.tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)),
      );

      for (const tagName of uniqueTags) {
        const tag = await tx.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });

        await tx.taskTag.create({
          data: {
            taskId: task.id,
            tagId: tag.id,
          },
        });
      }
    }

    return project;
  });

  return this.loadProjectWithTasks(projectRecord.id);
}

  private async loadProjectWithTasks(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        completedBy: { select: { id: true, name: true, email: true } },
        tasks: {
          orderBy: { deadline: 'asc' },
          include: {
            tags: { include: { tag: true } },
            assignedTo: { select: { id: true, name: true, email: true } },
            submittedBy: { select: { id: true, name: true, email: true } },
            completedBy: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.mapProject(project);
  }

  private mapProject(project: any) {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      color: project.color,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      deadline: project.deadline,
      status: project.status,
      completedAt: project.completedAt,
      completedBy: project.completedBy
        ? { id: project.completedBy.id, name: project.completedBy.name, email: project.completedBy.email }
        : null,
      tasks: (project.tasks ?? []).map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        deadline: task.deadline,
        submittedAt: task.submittedAt,
        completedAt: task.completedAt,
        submittedBy: task.submittedBy
          ? { id: task.submittedBy.id, name: task.submittedBy.name, email: task.submittedBy.email }
          : null,
        completedBy: task.completedBy
          ? { id: task.completedBy.id, name: task.completedBy.name, email: task.completedBy.email }
          : null,
        tags: (task.tags ?? []).map((tag: any) => tag.tag.name),
        assignedTo: task.assignedTo
          ? { id: task.assignedTo.id, name: task.assignedTo.name, email: task.assignedTo.email }
          : null,
      })),
    };
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
    include: {
      project: {
        include: {
          completedBy: { select: { id: true, name: true, email: true } },
          tasks: {
            orderBy: { deadline: 'asc' },
            include: {
              tags: { include: { tag: true } },
              assignedTo: { select: { id: true, name: true, email: true } },
              submittedBy: { select: { id: true, name: true, email: true } },
              completedBy: { select: { id: true, name: true, email: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const admin = memberships
    .filter((membership) => membership.role === 'ADMIN')
    .map((membership) => this.mapProject(membership.project));

  const member = memberships
    .filter((membership) => membership.role === 'MEMBER')
    .map((membership) => this.mapProject(membership.project));

  return { admin, member };
}



  async updateProjectStatus(userId: number, projectId: number, status: ProjectStatus) {
    const project = await this.ensureProjectAdmin(projectId, userId);
    const data: Prisma.ProjectUpdateInput = { status };
    if (status === ProjectStatus.COMPLETED) {
      const now = new Date();
      data.completedAt = project.completedAt ?? now;
      data.completedBy = { connect: { id: userId } };
    } else {
      data.completedAt = null;
      if (project.completedById) {
        data.completedBy = { disconnect: true };
      }
    }

    await this.prisma.project.update({
      where: { id: projectId },
      data,
    });
    return this.loadProjectWithTasks(projectId);
  }


  async deleteProject(userId: number, projectId: number) {
    await this.ensureProjectAdmin(projectId, userId);

    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      select: { id: true },
    });
    const taskIds = tasks.map((t) => t.id);

    await this.prisma.$transaction(async (tx) => {
      if (taskIds.length) {
        await tx.taskTag.deleteMany({ where: { taskId: { in: taskIds } } });
        await tx.submission.deleteMany({ where: { taskId: { in: taskIds } } });
        await tx.rating.deleteMany({
          where: {
            OR: [{ taskId: { in: taskIds } }, { projectId }],
          },
        });
        await tx.task.deleteMany({ where: { id: { in: taskIds } } });
      } else {
        await tx.rating.deleteMany({ where: { projectId } });
      }

      await tx.projectInvitation.deleteMany({ where: { projectId } });
      await tx.projectMember.deleteMany({ where: { projectId } });
      await tx.project.delete({ where: { id: projectId } });
    });

    return { success: true };
  }
}







