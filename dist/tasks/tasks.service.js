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
        const membership = project.members.find((m) => m.userId === userId);
        if (!isCreator && !membership)
            throw new common_1.ForbiddenException('Access denied to this project');
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
                where: { projectId_userId: { projectId: dto.projectId, userId: dto.assignedToId } },
            });
            if (!assignee && dto.assignedToId !== project.creatorId) {
                throw new common_1.ForbiddenException('Assignee must be a project member');
            }
            const userExists = await this.prisma.user.findUnique({ where: { id: dto.assignedToId } });
            if (!userExists)
                throw new common_1.NotFoundException('Assignee user not found');
            assignedToConnect = { connect: { id: dto.assignedToId } };
        }
        let assignedGroupConnect = undefined;
        if (dto.assignedGroupId) {
            const group = await this.prisma.group.findUnique({ where: { id: dto.assignedGroupId } });
            if (!group)
                throw new common_1.NotFoundException('Group not found');
            if (!project.groupId || project.groupId !== group.id) {
                throw new common_1.ForbiddenException('Task group must match project group');
            }
            assignedGroupConnect = { connect: { id: group.id } };
        }
        let parentTaskConnect = undefined;
        if (dto.parentTaskId) {
            const parentTask = await this.prisma.task.findUnique({ where: { id: dto.parentTaskId } });
            if (!parentTask)
                throw new common_1.NotFoundException('Parent task not found');
            if (parentTask.projectId !== dto.projectId) {
                throw new common_1.ForbiddenException('Parent task must belong to the same project');
            }
            parentTaskConnect = { connect: { id: parentTask.id } };
        }
        if (dto.themeId) {
            const themeExists = await this.prisma.theme.findUnique({ where: { id: dto.themeId } });
            if (!themeExists)
                throw new common_1.NotFoundException('Theme not found');
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
    async updateTask(userId, taskId, dto) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { project: { select: { id: true, creatorId: true, groupId: true } } },
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
            data.status = dto.status;
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
                        projectId_userId: { projectId: task.projectId, userId: dto.assignedToId },
                    },
                });
                if (!assignee && dto.assignedToId !== task.project.creatorId) {
                    throw new common_1.ForbiddenException('Assignee must be project member');
                }
                const userExists = await this.prisma.user.findUnique({ where: { id: dto.assignedToId } });
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
                const group = await this.prisma.group.findUnique({ where: { id: dto.assignedGroupId } });
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
                const theme = await this.prisma.theme.findUnique({ where: { id: dto.themeId } });
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
    taskInclude() {
        return {
            assignedTo: { select: { id: true, name: true, email: true } },
            assignedGroup: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } },
            parentTask: { select: { id: true, title: true } },
        };
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map