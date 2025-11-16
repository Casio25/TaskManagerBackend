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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let TasksService = class TasksService {
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
        const membership = project.members.find((member) => member.userId === userId);
        if (!isCreator && !membership) {
            throw new common_1.ForbiddenException('Access denied to this project');
        }
        return { project, membership, isCreator };
    }
    isAdmin(membership, isCreator) {
        return isCreator || membership?.role === 'ADMIN';
    }
    async createTask(userId, dto) {
        const { project, membership, isCreator } = await this.ensureProjectMember(dto.projectId, userId);
        if (!this.isAdmin(membership, isCreator)) {
            throw new common_1.ForbiddenException('Only project admins can create tasks');
        }
        let assignedToConnect = undefined;
        if (dto.assignedToId) {
            const assignee = await this.prisma.projectMember.findUnique({
                where: {
                    projectId_userId: {
                        projectId: dto.projectId,
                        userId: dto.assignedToId,
                    },
                },
            });
            if (!assignee && dto.assignedToId !== project.creatorId) {
                throw new common_1.ForbiddenException('Assignee must be a project member');
            }
            const userExists = await this.prisma.user.findUnique({
                where: { id: dto.assignedToId },
            });
            if (!userExists)
                throw new common_1.NotFoundException('Assignee user not found');
            assignedToConnect = { connect: { id: dto.assignedToId } };
        }
        let assignedGroupConnect = undefined;
        if (dto.assignedGroupId) {
            const group = await this.prisma.group.findUnique({
                where: { id: dto.assignedGroupId },
            });
            if (!group)
                throw new common_1.NotFoundException('Group not found');
            if (!project.groupId || project.groupId !== group.id) {
                throw new common_1.ForbiddenException('Task group must match project group');
            }
            assignedGroupConnect = { connect: { id: group.id } };
        }
        let parentTaskConnect = undefined;
        if (dto.parentTaskId) {
            const parentTask = await this.prisma.task.findUnique({
                where: { id: dto.parentTaskId },
            });
            if (!parentTask)
                throw new common_1.NotFoundException('Parent task not found');
            if (parentTask.projectId !== dto.projectId) {
                throw new common_1.ForbiddenException('Parent task must belong to the same project');
            }
            parentTaskConnect = { connect: { id: parentTask.id } };
        }
        if (dto.themeId) {
            const themeExists = await this.prisma.theme.findUnique({
                where: { id: dto.themeId },
            });
            if (!themeExists)
                throw new common_1.NotFoundException('Theme not found');
        }
        const status = dto.status ?? client_1.TaskStatus.NEW;
        const now = new Date();
        const data = {
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
        if (status === client_1.TaskStatus.SUBMITTED || status === client_1.TaskStatus.COMPLETED) {
            data.submittedAt = now;
            data.submittedBy = { connect: { id: userId } };
        }
        if (status === client_1.TaskStatus.COMPLETED) {
            data.completedAt = now;
            data.completedBy = { connect: { id: userId } };
        }
        const task = await this.prisma.task.create({
            data,
            include: this.taskInclude(),
        });
        return task;
    }
    async updateTask(userId, taskId, dto) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: { select: { id: true, creatorId: true, groupId: true } },
            },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        const { membership, isCreator } = await this.ensureProjectMember(task.projectId, userId);
        const isAdmin = this.isAdmin(membership, isCreator);
        if (!isAdmin && task.assignedToId !== userId) {
            throw new common_1.ForbiddenException('You cannot update this task');
        }
        const data = {};
        if (dto.title !== undefined)
            data.title = dto.title;
        if (dto.description !== undefined)
            data.description = dto.description;
        if (dto.status !== undefined) {
            const now = new Date();
            if (dto.status === client_1.TaskStatus.SUBMITTED) {
                if (!isAdmin && task.assignedToId !== userId) {
                    throw new common_1.ForbiddenException('Only the assignee can submit this task');
                }
                data.status = client_1.TaskStatus.SUBMITTED;
                data.submittedAt = now;
                data.submittedBy = { connect: { id: userId } };
                data.completedAt = null;
                if (task.completedById) {
                    data.completedBy = { disconnect: true };
                }
            }
            else if (dto.status === client_1.TaskStatus.COMPLETED) {
                if (!isAdmin) {
                    throw new common_1.ForbiddenException('Only project admins can complete tasks');
                }
                data.status = client_1.TaskStatus.COMPLETED;
                data.completedAt = now;
                data.completedBy = { connect: { id: userId } };
                if (!task.submittedById) {
                    data.submittedAt = now;
                    data.submittedBy = { connect: { id: userId } };
                }
            }
            else {
                if (!isAdmin) {
                    throw new common_1.ForbiddenException('Only project admins can change this status');
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
            if (!isAdmin)
                throw new common_1.ForbiddenException('Only admins can reassign tasks');
            if (dto.assignedToId === null) {
                data.assignedTo = { disconnect: true };
            }
            else {
                const assignee = await this.prisma.projectMember.findUnique({
                    where: {
                        projectId_userId: {
                            projectId: task.projectId,
                            userId: dto.assignedToId,
                        },
                    },
                });
                if (!assignee && dto.assignedToId !== task.project.creatorId) {
                    throw new common_1.ForbiddenException('Assignee must be project member');
                }
                const userExists = await this.prisma.user.findUnique({
                    where: { id: dto.assignedToId },
                });
                if (!userExists)
                    throw new common_1.NotFoundException('Assignee not found');
                data.assignedTo = { connect: { id: dto.assignedToId } };
            }
        }
        if (dto.assignedGroupId !== undefined) {
            if (!isAdmin)
                throw new common_1.ForbiddenException('Only admins can update task group');
            if (dto.assignedGroupId === null) {
                data.assignedGroup = { disconnect: true };
            }
            else {
                const group = await this.prisma.group.findUnique({
                    where: { id: dto.assignedGroupId },
                });
                if (!group)
                    throw new common_1.NotFoundException('Group not found');
                if (!task.project.groupId || task.project.groupId !== group.id) {
                    throw new common_1.ForbiddenException('Task group must match project group');
                }
                data.assignedGroup = { connect: { id: dto.assignedGroupId } };
            }
        }
        if (dto.themeId !== undefined) {
            if (dto.themeId === null) {
                data.theme = { disconnect: true };
            }
            else {
                const theme = await this.prisma.theme.findUnique({
                    where: { id: dto.themeId },
                });
                if (!theme)
                    throw new common_1.NotFoundException('Theme not found');
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
    async listProjectTasks(userId, projectId) {
        await this.ensureProjectMember(projectId, userId);
        return this.prisma.task.findMany({
            where: { projectId },
            orderBy: [{ deadline: 'asc' }, { createdAt: 'asc' }],
            include: this.taskInclude(),
        });
    }
    async listUserTasks(userId) {
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
    async completeTask(userId, taskId) {
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
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        const { membership, isCreator } = await this.ensureProjectMember(task.projectId, userId);
        const isAdmin = this.isAdmin(membership, isCreator);
        const now = new Date();
        if (!isAdmin) {
            if (task.assignedToId !== userId) {
                throw new common_1.ForbiddenException('Only the assignee can submit this task');
            }
            if (task.status === client_1.TaskStatus.SUBMITTED &&
                task.submittedById === userId) {
                return this.prisma.task.findUnique({
                    where: { id: taskId },
                    include: this.taskInclude(),
                });
            }
            return this.prisma.task.update({
                where: { id: taskId },
                data: {
                    status: client_1.TaskStatus.SUBMITTED,
                    submittedAt: now,
                    submittedBy: { connect: { id: userId } },
                    completedAt: null,
                    ...(task.completedById ? { completedBy: { disconnect: true } } : {}),
                },
                include: this.taskInclude(),
            });
        }
        if (task.status === client_1.TaskStatus.COMPLETED && task.completedById) {
            return this.prisma.task.findUnique({
                where: { id: taskId },
                include: this.taskInclude(),
            });
        }
        const data = {
            status: client_1.TaskStatus.COMPLETED,
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
    async reopenTask(userId, taskId) {
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
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        const { membership, isCreator } = await this.ensureProjectMember(task.projectId, userId);
        if (!this.isAdmin(membership, isCreator)) {
            throw new common_1.ForbiddenException('Only project admins can reopen tasks');
        }
        if (task.status !== client_1.TaskStatus.SUBMITTED &&
            task.status !== client_1.TaskStatus.COMPLETED) {
            return this.prisma.task.findUnique({
                where: { id: taskId },
                include: this.taskInclude(),
            });
        }
        return this.prisma.task.update({
            where: { id: taskId },
            data: {
                status: client_1.TaskStatus.IN_PROGRESS,
                submittedAt: null,
                completedAt: null,
                ...(task.submittedById ? { submittedBy: { disconnect: true } } : {}),
                ...(task.completedById ? { completedBy: { disconnect: true } } : {}),
            },
            include: this.taskInclude(),
        });
    }
    async rateTask(userId, taskId, dto) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: { select: { id: true, creatorId: true } },
                tags: { include: { tag: true } },
                assignedTo: { select: { id: true, name: true, email: true } },
            },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        const { membership, isCreator } = await this.ensureProjectMember(task.projectId, userId);
        if (!this.isAdmin(membership, isCreator)) {
            throw new common_1.ForbiddenException('Only project admins can rate tasks');
        }
        if (task.status !== client_1.TaskStatus.COMPLETED) {
            throw new common_1.BadRequestException('Task must be completed before rating');
        }
        if (!task.assignedTo?.id) {
            throw new common_1.BadRequestException('Task does not have an assignee to rate');
        }
        const assigneeId = task.assignedTo.id;
        const tagLinks = task.tags ?? [];
        const result = await this.prisma.$transaction(async (tx) => {
            const rating = await tx.rating.upsert({
                where: {
                    taskId_userId_scope: {
                        taskId,
                        userId: assigneeId,
                        scope: client_1.RatingScope.TASK,
                    },
                },
                update: {
                    punctuality: dto.punctuality,
                    teamwork: dto.teamwork,
                    quality: dto.quality,
                    comments: dto.comments ?? null,
                    ratedBy: { connect: { id: userId } },
                },
                create: {
                    scope: client_1.RatingScope.TASK,
                    punctuality: dto.punctuality,
                    teamwork: dto.teamwork,
                    quality: dto.quality,
                    comments: dto.comments ?? null,
                    user: { connect: { id: assigneeId } },
                    ratedBy: { connect: { id: userId } },
                    task: { connect: { id: taskId } },
                    project: { connect: { id: task.project.id } },
                },
            });
            const summaries = [];
            for (const link of tagLinks) {
                const summary = await this.recalculateTagPerformance(tx, assigneeId, link.tagId);
                summaries.push({ tagId: link.tagId, data: summary });
            }
            return { rating, summaries };
        });
        const performances = tagLinks.map((link) => {
            const summary = result.summaries.find((item) => item.tagId === link.tagId)?.data ||
                null;
            return { tagId: link.tagId, tagName: link.tag.name, summary };
        });
        return { rating: result.rating, performances };
    }
    async recalculateTagPerformance(tx, userId, tagId) {
        const aggregates = await tx.rating.aggregate({
            _avg: { punctuality: true, teamwork: true, quality: true },
            _count: { _all: true },
            where: {
                userId,
                scope: client_1.RatingScope.TASK,
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
                scope: client_1.RatingScope.TASK,
                task: {
                    tags: {
                        some: { tagId },
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
            select: {
                punctuality: true,
                teamwork: true,
                quality: true,
                updatedAt: true,
                taskId: true,
            },
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
    taskInclude() {
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
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map