
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProjectRole, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { RateTaskDto } from './dto/rate-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureProjectMember(projectId: number, userId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        creatorId: true,
        groupId: true,
        members: { select: { userId: true, role: true } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    const isCreator = project.creatorId === userId;
    const membership = project.members.find((member) => member.userId === userId);
    if (!isCreator && !membership) {
      throw new ForbiddenException('Access denied to this project');
    }
    return { project, membership, isCreator };
  }

  private isAdmin(membership: { userId: number; role: ProjectRole } | undefined, isCreator: boolean) {
    return isCreator || membership?.role === 'ADMIN';
  }

  async createTask(userId: number, dto: CreateTaskDto) {
    const { project, membership, isCreator } = await this.ensureProjectMember(dto.projectId, userId);
    if (!this.isAdmin(membership, isCreator)) {
      throw new ForbiddenException('Only project admins can create tasks');
    }

    let assignedToConnect: Prisma.TaskCreateInput['assignedTo'] = undefined;
    if (dto.assignedToId) {
      const assignee = await this.prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: dto.projectId, userId: dto.assignedToId } },
      });
      if (!assignee && dto.assignedToId !== project.creatorId) {
        throw new ForbiddenException('Assignee must be a project member');
      }
      const userExists = await this.prisma.user.findUnique({ where: { id: dto.assignedToId } });
      if (!userExists) throw new NotFoundException('Assignee user not found');
      assignedToConnect = { connect: { id: dto.assignedToId } };
    }

    let assignedGroupConnect: Prisma.TaskCreateInput['assignedGroup'] = undefined;
    if (dto.assignedGroupId) {
      const group = await this.prisma.group.findUnique({ where: { id: dto.assignedGroupId } });
      if (!group) throw new NotFoundException('Group not found');
      if (!project.groupId || project.groupId !== group.id) {
        throw new ForbiddenException('Task group must match project group');
      }
      assignedGroupConnect = { connect: { id: group.id } };
    }

    let parentTaskConnect: Prisma.TaskCreateInput['parentTask'] = undefined;
    if (dto.parentTaskId) {
      const parentTask = await this.prisma.task.findUnique({ where: { id: dto.parentTaskId } });
      if (!parentTask) throw new NotFoundException('Parent task not found');
      if (parentTask.projectId !== dto.projectId) {
        throw new ForbiddenException('Parent task must belong to the same project');
      }
      parentTaskConnect = { connect: { id: parentTask.id } };
    }

    if (dto.themeId) {
      const themeExists = await this.prisma.theme.findUnique({ where: { id: dto.themeId } });
      if (!themeExists) throw new NotFoundException('Theme not found');
    }

    const status = dto.status ?? TaskStatus.NEW;
    const now = new Date();

    const data: Prisma.TaskCreateInput = {
      title: dto.title,
      description: dto.description,
      status,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
      project: { connect: { id: dto.projectId } },
      assignedTo: assignedToConnect,
      assignedGroup: assignedGroupConnect,
      parentTask: parentTaskConnect,
      theme: dto.themeId ? { connect: { id: dto.themeId } } : undefined,
    };

    if (status === TaskStatus.SUBMITTED || status === TaskStatus.COMPLETED) {
      data.submittedAt = now;
      data.submittedBy = { connect: { id: userId } };
    }
    if (status === TaskStatus.COMPLETED) {
      data.completedAt = now;
      data.completedBy = { connect: { id: userId } };
    }

    const task = await this.prisma.task.create({
      data,
      include: this.taskInclude(),
    });

    return task;
  }

  async updateTask(userId: number, taskId: number, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { select: { id: true, creatorId: true, groupId: true } } },
    });
    if (!task) throw new NotFoundException('Task not found');

    const { membership, isCreator } = await this.ensureProjectMember(task.projectId, userId);
    const isAdmin = this.isAdmin(membership, isCreator);
    if (!isAdmin && task.assignedToId !== userId) {
      throw new ForbiddenException('You cannot update this task');
    }

    const data: Prisma.TaskUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;

    if (dto.status !== undefined) {
      const now = new Date();
      if (dto.status === TaskStatus.SUBMITTED) {
        if (!isAdmin && task.assignedToId !== userId) {
          throw new ForbiddenException('Only the assignee can submit this task');
        }
        data.status = TaskStatus.SUBMITTED;
        data.submittedAt = now;
        data.submittedBy = { connect: { id: userId } };
        data.completedAt = null;
        if (task.completedById) {
          data.completedBy = { disconnect: true };
        }
      } else if (dto.status === TaskStatus.COMPLETED) {
        if (!isAdmin) {
          throw new ForbiddenException('Only project admins can complete tasks');
        }
        data.status = TaskStatus.COMPLETED;
        data.completedAt = now;
        data.completedBy = { connect: { id: userId } };
        if (!task.submittedById) {
          data.submittedAt = now;
          data.submittedBy = { connect: { id: userId } };
        }
      } else {
        if (!isAdmin) {
          throw new ForbiddenException('Only project admins can change this status');
        }
        data.status = dto.status;
        data.completedAt = null;
        if (task.completedById) {
          data.completedBy = { disconnect: true };
        }
        data.submittedAt = null;
        if (task.submittedById) {
          data.submittedBy = { disconnect: true };
        }
      }
    }

    if (dto.deadline !== undefined) {
      data.deadline = dto.deadline ? new Date(dto.deadline) : null;
    }
    if (dto.assignedToId !== undefined) {
      if (!isAdmin) throw new ForbiddenException('Only admins can reassign tasks');
      if (dto.assignedToId === null) {
        data.assignedTo = { disconnect: true };
      } else {
        const assignee = await this.prisma.projectMember.findUnique({
          where: {
            projectId_userId: { projectId: task.projectId, userId: dto.assignedToId },
          },
        });
        if (!assignee && dto.assignedToId !== task.project.creatorId) {
          throw new ForbiddenException('Assignee must be project member');
        }
        const userExists = await this.prisma.user.findUnique({ where: { id: dto.assignedToId } });
        if (!userExists) throw new NotFoundException('Assignee not found');
        data.assignedTo = { connect: { id: dto.assignedToId } };
      }
    }
    if (dto.assignedGroupId !== undefined) {
      if (!isAdmin) throw new ForbiddenException('Only admins can update task group');
      if (dto.assignedGroupId === null) {
        data.assignedGroup = { disconnect: true };
      } else {
        const group = await this.prisma.group.findUnique({ where: { id: dto.assignedGroupId } });
        if (!group) throw new NotFoundException('Group not found');
        if (!task.project.groupId || task.project.groupId !== group.id) {
          throw new ForbiddenException('Task group must match project group');
        }
        data.assignedGroup = { connect: { id: dto.assignedGroupId } };
      }
    }
    if (dto.themeId !== undefined) {
      if (dto.themeId === null) {
        data.theme = { disconnect: true };
      } else {
        const theme = await this.prisma.theme.findUnique({ where: { id: dto.themeId } });
        if (!theme) throw new NotFoundException('Theme not found');
        data.theme = { connect: { id: dto.themeId } };
      }
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data,
      include: this.taskInclude(),
    });
    return updated;
  }

  async listProjectTasks(userId: number, projectId: number) {
    await this.ensureProjectMember(projectId, userId);
    return this.prisma.task.findMany({
      where: { projectId },
      orderBy: [{ deadline: 'asc' }, { createdAt: 'asc' }],
      include: this.taskInclude(),
    });
  }

  async listUserTasks(userId: number) {
    return this.prisma.task.findMany({
      where: {
        OR: [
          { assignedToId: userId },
          {
            assignedGroup: {
              users: {
                some: {
                  userId,
                },
              },
            },
          },
        ],
      },
      include: this.taskInclude(),
      orderBy: [{ deadline: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async completeTask(userId: number, taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        projectId: true,
        assignedToId: true,
        status: true,
        submittedAt: true,
        submittedById: true,
        completedAt: true,
        completedById: true,
      },
    });
    if (!task) throw new NotFoundException('Task not found');

    const { membership, isCreator } = await this.ensureProjectMember(task.projectId, userId);
    const isAdmin = this.isAdmin(membership, isCreator);
    const now = new Date();

    if (!isAdmin) {
      if (task.assignedToId !== userId) {
        throw new ForbiddenException('Only the assignee can submit this task');
      }
      if (task.status === TaskStatus.SUBMITTED && task.submittedById === userId) {
        return this.prisma.task.findUnique({ where: { id: taskId }, include: this.taskInclude() });
      }
      return this.prisma.task.update({
        where: { id: taskId },
        data: {
          status: TaskStatus.SUBMITTED,
          submittedAt: now,
          submittedBy: { connect: { id: userId } },
          completedAt: null,
          ...(task.completedById ? { completedBy: { disconnect: true } } : {}),
        },
        include: this.taskInclude(),
      });
    }

    if (task.status === TaskStatus.COMPLETED && task.completedById) {
      return this.prisma.task.findUnique({ where: { id: taskId }, include: this.taskInclude() });
    }

    const data: Prisma.TaskUpdateInput = {
      status: TaskStatus.COMPLETED,
      completedAt: now,
      completedBy: { connect: { id: userId } },
    };
    if (!task.submittedById) {
      data.submittedAt = now;
      data.submittedBy = { connect: { id: userId } };
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data,
      include: this.taskInclude(),
    });
  }

  async reopenTask(userId: number, taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        projectId: true,
        status: true,
        submittedById: true,
        completedById: true,
      },
    });
    if (!task) throw new NotFoundException('Task not found');

    const { membership, isCreator } = await this.ensureProjectMember(task.projectId, userId);
    if (!this.isAdmin(membership, isCreator)) {
      throw new ForbiddenException('Only project admins can reopen tasks');
    }

    if (task.status !== TaskStatus.SUBMITTED && task.status !== TaskStatus.COMPLETED) {
      return this.prisma.task.findUnique({ where: { id: taskId }, include: this.taskInclude() });
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.IN_PROGRESS,
        submittedAt: null,
        completedAt: null,
        ...(task.submittedById ? { submittedBy: { disconnect: true } } : {}),
        ...(task.completedById ? { completedBy: { disconnect: true } } : {}),
      },
      include: this.taskInclude(),
    });
  }

  async rateTask(userId: number, taskId: number, dto: RateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { select: { id: true, creatorId: true } },
        tags: { include: { tag: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');

    const { membership, isCreator } = await this.ensureProjectMember(task.projectId, userId);
    if (!this.isAdmin(membership, isCreator)) {
      throw new ForbiddenException('Only project admins can rate tasks');
    }
    if (task.status !== TaskStatus.COMPLETED) {
      throw new BadRequestException('Task must be completed before rating');
    }
    if (!task.assignedTo?.id) {
      throw new BadRequestException('Task does not have an assignee to rate');
    }

    const assigneeId = task.assignedTo.id;
    const tagLinks = task.tags ?? [];

    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.rating.findFirst({
        where: { taskId, userId: assigneeId },
      });
      const ratingData = {
        punctuality: dto.punctuality,
        teamwork: dto.teamwork,
        quality: dto.quality,
        comments: dto.comments ?? null,
      };
      let rating;
      if (existing) {
        rating = await tx.rating.update({
          where: { id: existing.id },
          data: ratingData,
        });
      } else {
        rating = await tx.rating.create({
          data: {
            ...ratingData,
            user: { connect: { id: assigneeId } },
            task: { connect: { id: taskId } },
            project: { connect: { id: task.project.id } },
          },
        });
      }

      const summaries: Array<{ tagId: number; data: any }> = [];
      for (const link of tagLinks) {
        const summary = await this.recalculateTagPerformance(
          tx,
          assigneeId,
          link.tagId,
        );
        summaries.push({ tagId: link.tagId, data: summary });
      }

      return { rating, summaries };
    });

    const performances = tagLinks.map((link) => {
      const summary =
        result.summaries.find((item) => item.tagId === link.tagId)?.data ||
        null;
      return { tagId: link.tagId, tagName: link.tag.name, summary };
    });

    return { rating: result.rating, performances };
  }

  private async recalculateTagPerformance(
    tx: Prisma.TransactionClient,
    userId: number,
    tagId: number,
  ) {
    const aggregates = await tx.rating.aggregate({
      _avg: { punctuality: true, teamwork: true, quality: true },
      _count: { _all: true },
      where: {
        userId,
        task: {
          tags: {
            some: { tagId },
          },
        },
      },
    });

    const count = aggregates._count?._all ?? 0;
    if (!count) {
      await tx.userTagPerformance
        .delete({ where: { userId_tagId: { userId, tagId } } })
        .catch(() => undefined);
      return null;
    }

    const last = await tx.rating.findFirst({
      where: {
        userId,
        task: {
          tags: {
            some: { tagId },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      select: { punctuality: true, teamwork: true, quality: true, updatedAt: true, taskId: true },
    });

    const summary = {
      averagePunctuality: aggregates._avg.punctuality ?? 0,
      averageTeamwork: aggregates._avg.teamwork ?? 0,
      averageQuality: aggregates._avg.quality ?? 0,
      ratingsCount: count,
      lastPunctuality: last?.punctuality ?? null,
      lastTeamwork: last?.teamwork ?? null,
      lastQuality: last?.quality ?? null,
      lastTaskId: last?.taskId ?? null,
      lastRatedAt: last?.updatedAt ?? null,
    };

    await tx.userTagPerformance.upsert({
      where: { userId_tagId: { userId, tagId } },
      create: {
        userId,
        tagId,
        ...summary,
      },
      update: summary,
    });

    return summary;
  }

  private taskInclude(): Prisma.TaskInclude {
    return {
      assignedTo: { select: { id: true, name: true, email: true } },
      assignedGroup: { select: { id: true, name: true } },
      submittedBy: { select: { id: true, name: true, email: true } },
      completedBy: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true } },
      parentTask: { select: { id: true, title: true } },
      tags: { include: { tag: true } },
    };
  }
}

