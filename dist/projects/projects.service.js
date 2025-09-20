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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
function makeToken(inviteId, secret) {
    return `${inviteId}.${secret}`;
}
function parseToken(token) {
    const [idStr, secret] = token.split('.', 2);
    const id = Number(idStr);
    if (!id || !secret)
        throw new common_1.ForbiddenException('Invalid token');
    return { id, secret };
}
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createProject(userId, dto) {
        const { tasks, deadline, groupId: requestedGroupId, name, description } = dto;
        const trimmedName = name.trim();
        if (!trimmedName) {
            throw new common_1.BadRequestException('Project name is required');
        }
        const trimmedDescription = description?.trim() || undefined;
        let groupId;
        if (requestedGroupId !== undefined) {
            const group = await this.prisma.group.findUnique({ where: { id: requestedGroupId } });
            if (!group)
                throw new common_1.NotFoundException('Group not found');
            if (group.adminId !== userId) {
                throw new common_1.ForbiddenException('Only group admin can create a project in this group');
            }
            groupId = requestedGroupId;
        }
        const projectDeadline = new Date(deadline);
        if (Number.isNaN(projectDeadline.getTime())) {
            throw new common_1.BadRequestException('Invalid deadline');
        }
        const projectRecord = await this.prisma.$transaction(async (tx) => {
            const project = await tx.project.create({
                data: {
                    name: trimmedName,
                    description: trimmedDescription,
                    creatorId: userId,
                    groupId,
                    deadline: projectDeadline,
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
                    throw new common_1.BadRequestException(`Invalid task deadline for "${taskDto.title}"`);
                }
                if (taskDeadline.getTime() > projectDeadline.getTime()) {
                    throw new common_1.BadRequestException(`Task deadline cannot be later than project deadline for "${taskDto.title}"`);
                }
                const trimmedTitle = taskDto.title.trim();
                if (!trimmedTitle) {
                    throw new common_1.BadRequestException('Task title is required');
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
                const uniqueTags = Array.from(new Set(taskDto.tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)));
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
    async loadProjectWithTasks(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                tasks: {
                    orderBy: { deadline: 'asc' },
                    include: {
                        tags: {
                            include: { tag: true },
                        },
                        assignedTo: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return this.mapProject(project);
    }
    mapProject(project) {
        return {
            id: project.id,
            name: project.name,
            description: project.description,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            deadline: project.deadline,
            tasks: (project.tasks ?? []).map((task) => ({
                id: task.id,
                title: task.title,
                description: task.description,
                status: task.status,
                deadline: task.deadline,
                tags: (task.tags ?? []).map((tag) => tag.tag.name),
                assignedTo: task.assignedTo
                    ? { id: task.assignedTo.id, name: task.assignedTo.name, email: task.assignedTo.email }
                    : null,
            })),
        };
    }
    async ensureProjectAdmin(projectId, userId) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (project.creatorId === userId)
            return project;
        const membership = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
            select: { role: true },
        });
        if (!membership || membership.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only project admin allowed');
        }
        return project;
    }
    async createInvite(projectId, invitedById, dto) {
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
    async acceptInvite(userId, userEmail, dto) {
        const { id, secret } = parseToken(dto.token);
        const invite = await this.prisma.projectInvitation.findUnique({ where: { id } });
        if (!invite)
            throw new common_1.NotFoundException('Invite not found');
        if (invite.status !== 'PENDING')
            throw new common_1.ForbiddenException('Invite is not active');
        if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
            throw new common_1.ForbiddenException('Invite expired');
        }
        if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
            throw new common_1.ForbiddenException('Invite email mismatch');
        }
        const ok = await bcrypt.compare(secret, invite.tokenHash);
        if (!ok)
            throw new common_1.ForbiddenException('Invalid token');
        await this.prisma.projectMember.upsert({
            where: { projectId_userId: { projectId: invite.projectId, userId } },
            create: { projectId: invite.projectId, userId, role: 'MEMBER' },
            update: {},
        });
        const updated = await this.prisma.projectInvitation.update({
            where: { id: invite.id },
            data: { status: 'ACCEPTED', acceptedById: userId, acceptedAt: new Date() },
        });
        return { invitation: updated };
    }
    async myProjects(userId) {
        const memberships = await this.prisma.projectMember.findMany({
            where: { userId },
            include: {
                project: {
                    include: {
                        tasks: {
                            orderBy: { deadline: 'asc' },
                            include: {
                                tags: {
                                    include: { tag: true },
                                },
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
    async deleteProject(userId, projectId) {
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
            }
            else {
                await tx.rating.deleteMany({ where: { projectId } });
            }
            await tx.projectInvitation.deleteMany({ where: { projectId } });
            await tx.projectMember.deleteMany({ where: { projectId } });
            await tx.project.delete({ where: { id: projectId } });
        });
        return { success: true };
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map