import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProjectRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type DateRange = { from?: Date; to?: Date };

@Injectable()
export class CalendarService {
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
    if (!isCreator && !membership) {
      throw new ForbiddenException('Access denied to this project');
    }
    return { membership, isCreator };
  }

  private isAdmin(
    membership: { userId: number; role: ProjectRole } | undefined,
    isCreator: boolean,
  ) {
    return isCreator || membership?.role === 'ADMIN';
  }

  async userCalendar(userId: number, range: DateRange) {
    const where: Prisma.TaskWhereInput = {
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
    };
    const deadlineFilter = this.deadlineFilter(range);
    if (deadlineFilter) where.deadline = deadlineFilter;

    return this.prisma.task.findMany({
      where,
      include: this.includeTask(),
      orderBy: [{ deadline: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async projectCalendar(userId: number, projectId: number, range: DateRange) {
    const context = await this.ensureProjectMember(projectId, userId);
    if (!this.isAdmin(context.membership, context.isCreator)) {
      throw new ForbiddenException(
        'Only project admins can view project calendar',
      );
    }

    const where: Prisma.TaskWhereInput = { projectId };
    const deadlineFilter = this.deadlineFilter(range);
    if (deadlineFilter) where.deadline = deadlineFilter;

    return this.prisma.task.findMany({
      where,
      include: this.includeTask(true),
      orderBy: [{ deadline: 'asc' }, { createdAt: 'asc' }],
    });
  }

  private deadlineFilter(
    range: DateRange,
  ): Prisma.DateTimeNullableFilter | undefined {
    const filter: Prisma.DateTimeNullableFilter = {};
    if (range.from) filter.gte = range.from;
    if (range.to) filter.lte = range.to;
    if (Object.keys(filter).length === 0) return undefined;
    filter.not = null;
    return filter;
  }

  private includeTask(includeProjectMembers = false): Prisma.TaskInclude {
    return {
      assignedTo: { select: { id: true, name: true, email: true } },
      assignedGroup: { select: { id: true, name: true } },
      project: {
        select: {
          id: true,
          name: true,
          color: true,
          members: includeProjectMembers
            ? {
                select: {
                  userId: true,
                  role: true,
                  user: { select: { id: true, name: true, email: true } },
                },
              }
            : undefined,
        },
      },
    };
  }
}
