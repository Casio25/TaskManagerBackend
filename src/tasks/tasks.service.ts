import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Prisma, ProjectRole } from '@prisma/client';

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
    const membership = project.members.find((m) => m.userId === userId);
    if (!isCreator && !membership) throw new ForbiddenException('Access denied to this project');
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

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        project: { connect: { id: dto.projectId } },
        assignedTo: assignedToConnect,
        assignedGroup: assignedGroupConnect,
        parentTask: parentTaskConnect,
        theme: dto.themeId ? { connect: { id: dto.themeId } } : undefined,
        status: dto.status,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
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
      data.status = dto.status;
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

  private taskInclude(): Prisma.TaskInclude {
    return {
      assignedTo: { select: { id: true, name: true, email: true } },
      assignedGroup: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      parentTask: { select: { id: true, title: true } },
    };
  }
}
