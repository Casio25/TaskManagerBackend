"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async teamAnalytics(ownerId, listId, query) {
        const fromDate = this.parseDate(query.from, 'from');
        const toDate = this.parseDate(query.to, 'to');
        if (fromDate && toDate && fromDate > toDate) {
            throw new common_1.BadRequestException('`from` must be before `to`');
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
            throw new common_1.NotFoundException('Team not found');
        }
        const contacts = list.members
            .map((member) => member.colleague?.contact)
            .filter((contact) => Boolean(contact));
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
        const accessibleProjectWhere = {
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
    parseDate(value, label) {
        if (!value)
            return undefined;
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            throw new common_1.BadRequestException(`Invalid ${label} date`);
        }
        return parsed;
    }
    buildDateRange(from, to) {
        if (!from && !to)
            return undefined;
        const range = {};
        if (from)
            range.gte = from;
        if (to)
            range.lte = to;
        return range;
    }
    computeRatingAverages(records) {
        if (!records.length) {
            return null;
        }
        const totals = records.reduce((acc, record) => {
            acc.count += 1;
            acc.punctuality += record.punctuality;
            acc.teamwork += record.teamwork;
            acc.quality += record.quality;
            return acc;
        }, { count: 0, punctuality: 0, teamwork: 0, quality: 0 });
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
    buildTopPerformers(records, contacts) {
        if (!records.length)
            return [];
        const aggregates = new Map();
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
    computeOverdueShare(tasks, comparisonPoint) {
        if (!tasks.length) {
            return { total: 0, withDeadline: 0, overdue: 0, share: null };
        }
        const withDeadline = tasks.filter((task) => task.deadline);
        if (!withDeadline.length) {
            return { total: tasks.length, withDeadline: 0, overdue: 0, share: null };
        }
        const overdue = withDeadline.filter((task) => {
            const deadline = task.deadline;
            if (task.status === client_1.TaskStatus.COMPLETED && task.completedAt) {
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
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map