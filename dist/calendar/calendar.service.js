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
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CalendarService = class CalendarService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureProjectMember(projectId, userId) {
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
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const isCreator = project.creatorId === userId;
        const membership = project.members.find((m) => m.userId === userId);
        if (!isCreator && !membership) {
            throw new common_1.ForbiddenException('Access denied to this project');
        }
        return { membership, isCreator };
    }
    isAdmin(membership, isCreator) {
        return isCreator || membership?.role === 'ADMIN';
    }
    async userCalendar(userId, range) {
        const where = {
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
        if (deadlineFilter)
            where.deadline = deadlineFilter;
        return this.prisma.task.findMany({
            where,
            include: this.includeTask(),
            orderBy: [{ deadline: 'asc' }, { createdAt: 'asc' }],
        });
    }
    async projectCalendar(userId, projectId, range) {
        const context = await this.ensureProjectMember(projectId, userId);
        if (!this.isAdmin(context.membership, context.isCreator)) {
            throw new common_1.ForbiddenException('Only project admins can view project calendar');
        }
        const where = { projectId };
        const deadlineFilter = this.deadlineFilter(range);
        if (deadlineFilter)
            where.deadline = deadlineFilter;
        return this.prisma.task.findMany({
            where,
            include: this.includeTask(true),
            orderBy: [{ deadline: 'asc' }, { createdAt: 'asc' }],
        });
    }
    deadlineFilter(range) {
        const filter = {};
        if (range.from)
            filter.gte = range.from;
        if (range.to)
            filter.lte = range.to;
        if (Object.keys(filter).length === 0)
            return undefined;
        filter.not = null;
        return filter;
    }
    includeTask(includeProjectMembers = false) {
        return {
            assignedTo: { select: { id: true, name: true, email: true } },
            assignedGroup: { select: { id: true, name: true } },
            project: {
                select: {
                    id: true,
                    name: true,
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
};
exports.CalendarService = CalendarService;
exports.CalendarService = CalendarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CalendarService);
//# sourceMappingURL=calendar.service.js.map