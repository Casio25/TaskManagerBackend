import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface TeamAnalyticsQuery {
  from?: string;
  to?: string;
}

export interface RatingAggregate {
  count: number;
  punctuality: number;
  teamwork: number;
  quality: number;
  overall: number;
}

export interface OverdueAggregate {
  total: number;
  withDeadline: number;
  overdue: number;
  share: number | null;
}

export interface TeamAnalyticsTopPerformer {
  userId: number;
  name: string;
  email: string;
  ratingsCount: number;
  punctuality: number;
  teamwork: number;
  quality: number;
  overall: number;
}

export interface TeamAnalyticsResponse {
  list: {
    id: number;
    name: string;
    members: number;
    connectedMembers: number;
  };
  filters: {
    from: string | null;
    to: string | null;
  };
  ratingAverages: RatingAggregate | null;
  taskOverdue: OverdueAggregate;
  topPerformers: TeamAnalyticsTopPerformer[];
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async teamAnalytics(
    ownerId: number,
    listId: number,
    query: TeamAnalyticsQuery,
  ): Promise<TeamAnalyticsResponse> {
    const fromDate = this.parseDate(query.from, 'from');
    const toDate = this.parseDate(query.to, 'to');
    if (fromDate && toDate && fromDate > toDate) {
      throw new BadRequestException('`from` must be before `to`');
    }

    const list = await this.prisma.colleagueList.findFirst({
      where: { id: listId, ownerId },
      select: {
        id: true,
        name: true,
        members: {
          select: {
            id: true,
            colleague: {
              select: {
                id: true,
                email: true,
                contactId: true,
                contact: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
      },
    });

    if (!list) {
      throw new NotFoundException('Team not found');
    }

    const contacts = list.members
      .map((member) => member.colleague?.contact)
      .filter(
        (contact): contact is { id: number; name: string; email: string } =>
          Boolean(contact),
      );

    const contactIds = contacts.map((contact) => contact.id);
    const base = {
      list: {
        id: list.id,
        name: list.name,
        members: list.members.length,
        connectedMembers: contactIds.length,
      },
      filters: {
        from: fromDate ? fromDate.toISOString() : null,
        to: toDate ? toDate.toISOString() : null,
      },
    };

    if (!contactIds.length) {
      return {
        ...base,
        ratingAverages: null,
        taskOverdue: { total: 0, withDeadline: 0, overdue: 0, share: null },
        topPerformers: [],
      };
    }

    const accessibleProjectWhere: Prisma.ProjectWhereInput = {
      OR: [
        { creatorId: ownerId },
        { members: { some: { userId: ownerId, role: 'ADMIN' } } },
      ],
    };

    const dateRangeFilter = this.buildDateRange(fromDate, toDate);

    const [ratings, tasks] = await this.prisma.$transaction([
      this.prisma.rating.findMany({
        where: {
          userId: { in: contactIds },
          ...(dateRangeFilter ? { createdAt: dateRangeFilter } : {}),
          OR: [
            { project: accessibleProjectWhere },
            { task: { project: accessibleProjectWhere } },
          ],
        },
        select: {
          userId: true,
          punctuality: true,
          teamwork: true,
          quality: true,
        },
      }),
      this.prisma.task.findMany({
        where: {
          assignedToId: { in: contactIds },
          project: accessibleProjectWhere,
          ...(dateRangeFilter ? { deadline: dateRangeFilter } : {}),
        },
        select: {
          status: true,
          deadline: true,
          completedAt: true,
        },
      }),
    ]);

    const ratingAverages = this.computeRatingAverages(ratings);
    const topPerformers = this.buildTopPerformers(ratings, contacts);
    const taskOverdue = this.computeOverdueShare(tasks, toDate ?? new Date());

    return {
      ...base,
      ratingAverages,
      taskOverdue,
      topPerformers,
    };
  }

  private parseDate(value: string | undefined, label: 'from' | 'to') {
    if (!value) return undefined;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`Invalid ${label} date`);
    }
    return parsed;
  }

  private buildDateRange(
    from?: Date,
    to?: Date,
  ): Prisma.DateTimeFilter | undefined {
    if (!from && !to) return undefined;
    const range: Prisma.DateTimeFilter = {};
    if (from) range.gte = from;
    if (to) range.lte = to;
    return range;
  }

  private computeRatingAverages(
    records: Array<{ punctuality: number; teamwork: number; quality: number }>,
  ): RatingAggregate | null {
    if (!records.length) {
      return null;
    }
    const totals = records.reduce<{
      count: number;
      punctuality: number;
      teamwork: number;
      quality: number;
    }>(
      (acc, record) => {
        acc.count += 1;
        acc.punctuality += record.punctuality;
        acc.teamwork += record.teamwork;
        acc.quality += record.quality;
        return acc;
      },
      { count: 0, punctuality: 0, teamwork: 0, quality: 0 },
    );

    const punctuality = totals.punctuality / totals.count;
    const teamwork = totals.teamwork / totals.count;
    const quality = totals.quality / totals.count;
    const overall = (punctuality + teamwork + quality) / 3;

    return {
      count: totals.count,
      punctuality,
      teamwork,
      quality,
      overall,
    };
  }

  private buildTopPerformers(
    records: Array<{
      userId: number;
      punctuality: number;
      teamwork: number;
      quality: number;
    }>,
    contacts: Array<{ id: number; name: string; email: string }>,
  ) {
    if (!records.length) return [];
    const aggregates = new Map<
      number,
      { count: number; punctuality: number; teamwork: number; quality: number }
    >();

    for (const record of records) {
      const current = aggregates.get(record.userId) ?? {
        count: 0,
        punctuality: 0,
        teamwork: 0,
        quality: 0,
      };
      current.count += 1;
      current.punctuality += record.punctuality;
      current.teamwork += record.teamwork;
      current.quality += record.quality;
      aggregates.set(record.userId, current);
    }

    return Array.from(aggregates.entries())
      .map(([userId, stats]) => {
        const contact = contacts.find((item) => item.id === userId);
        const punctuality = stats.punctuality / stats.count;
        const teamwork = stats.teamwork / stats.count;
        const quality = stats.quality / stats.count;
        const overall = (punctuality + teamwork + quality) / 3;
        return {
          userId,
          name: contact?.name ?? 'Unknown',
          email: contact?.email ?? '',
          ratingsCount: stats.count,
          punctuality,
          teamwork,
          quality,
          overall,
        };
      })
      .sort((a, b) => b.overall - a.overall)
      .slice(0, 3);
  }

  private computeOverdueShare(
    tasks: Array<{
      status: TaskStatus;
      deadline: Date | null;
      completedAt: Date | null;
    }>,
    comparisonPoint: Date,
  ): OverdueAggregate {
    if (!tasks.length) {
      return { total: 0, withDeadline: 0, overdue: 0, share: null };
    }

    const withDeadline = tasks.filter((task) => task.deadline);
    if (!withDeadline.length) {
      return { total: tasks.length, withDeadline: 0, overdue: 0, share: null };
    }

    const overdue = withDeadline.filter((task) => {
      const deadline = task.deadline!;
      if (task.status === TaskStatus.COMPLETED && task.completedAt) {
        return task.completedAt.getTime() > deadline.getTime();
      }
      return deadline.getTime() < comparisonPoint.getTime();
    }).length;

    return {
      total: tasks.length,
      withDeadline: withDeadline.length,
      overdue,
      share: withDeadline.length ? overdue / withDeadline.length : null,
    };
  }
}
