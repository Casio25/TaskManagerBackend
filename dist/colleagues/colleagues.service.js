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
exports.ColleaguesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const DEFAULT_LISTS = ['Favorites', 'Team 1', 'Team 2'];
let ColleaguesService = class ColleaguesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    colleagueInclude = {
        contact: {
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        },
        listMemberships: {
            include: {
                list: {
                    select: { id: true, name: true },
                },
            },
        },
    };
    async list(ownerId) {
        await this.ensureDefaultLists(ownerId);
        const colleagues = await this.prisma.colleague.findMany({
            where: { ownerId },
            include: this.colleagueInclude,
            orderBy: { createdAt: 'desc' },
        });
        return Promise.all(colleagues.map((colleague) => this.buildColleagueResponse(ownerId, colleague)));
    }
    async create(ownerId, dto) {
        await this.ensureDefaultLists(ownerId);
        const listIds = this.normalizeListIds(dto.listIds);
        const email = dto.email.trim().toLowerCase();
        const owner = await this.prisma.user.findUnique({ where: { id: ownerId } });
        if (!owner)
            throw new common_1.NotFoundException('User not found');
        if (email === owner.email.toLowerCase()) {
            throw new common_1.BadRequestException('Cannot add yourself as a colleague');
        }
        const exists = await this.prisma.colleague.findUnique({
            where: { ownerId_email: { ownerId, email } },
        });
        if (exists) {
            throw new common_1.BadRequestException('Colleague already added');
        }
        const contact = await this.prisma.user.findUnique({ where: { email } });
        let colleague = await this.prisma.colleague.create({
            data: {
                ownerId,
                email,
                contactId: contact?.id,
            },
            include: this.colleagueInclude,
        });
        if (listIds.length) {
            const ownerLists = await this.prisma.colleagueList.findMany({
                where: { ownerId, id: { in: listIds } },
                select: { id: true },
            });
            if (ownerLists.length) {
                await this.prisma.$transaction(ownerLists.map((list) => this.prisma.colleagueListMember.upsert({
                    where: { listId_colleagueId: { listId: list.id, colleagueId: colleague.id } },
                    update: {},
                    create: { listId: list.id, colleagueId: colleague.id },
                })));
                colleague =
                    (await this.prisma.colleague.findUnique({
                        where: { id: colleague.id },
                        include: this.colleagueInclude,
                    })) ?? colleague;
            }
        }
        return this.buildColleagueResponse(ownerId, colleague);
    }
    async listLists(ownerId) {
        const lists = await this.ensureDefaultLists(ownerId);
        return lists.map((list) => this.mapList(list));
    }
    async createList(ownerId, dto) {
        const name = dto.name.trim();
        if (!name)
            throw new common_1.BadRequestException('List name is required');
        const existing = await this.prisma.colleagueList.findUnique({
            where: { ownerId_name: { ownerId, name } },
        });
        if (existing) {
            throw new common_1.BadRequestException('List with this name already exists');
        }
        const list = await this.prisma.colleagueList.create({
            data: { ownerId, name },
            include: {
                members: {
                    include: {
                        colleague: {
                            include: {
                                contact: {
                                    select: { id: true, email: true, name: true, role: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        return this.mapList(list);
    }
    async addToList(ownerId, listId, dto) {
        const list = await this.prisma.colleagueList.findFirst({
            where: { id: listId, ownerId },
            include: {
                members: {
                    include: {
                        colleague: {
                            include: {
                                contact: {
                                    select: { id: true, email: true, name: true, role: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!list)
            throw new common_1.NotFoundException('List not found');
        let colleague = await this.ensureColleague(ownerId, dto.colleagueId);
        await this.prisma.colleagueListMember.upsert({
            where: { listId_colleagueId: { listId, colleagueId: colleague.id } },
            create: { listId, colleagueId: colleague.id },
            update: {},
        });
        const updatedList = await this.prisma.colleagueList.findUnique({
            where: { id: listId },
            include: {
                members: {
                    include: {
                        colleague: {
                            include: {
                                contact: {
                                    select: { id: true, email: true, name: true, role: true },
                                },
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        const refreshedColleague = await this.prisma.colleague.findUnique({
            where: { id: colleague.id },
            include: this.colleagueInclude,
        });
        return {
            list: this.mapList(updatedList),
            colleague: await this.buildColleagueResponse(ownerId, refreshedColleague),
        };
    }
    async assignProject(ownerId, colleagueId, dto) {
        let colleague = await this.ensureColleague(ownerId, colleagueId);
        if (!colleague.contactId) {
            throw new common_1.BadRequestException('Colleague has not registered yet');
        }
        const project = await this.prisma.project.findUnique({
            where: { id: dto.projectId },
            include: {
                members: { select: { userId: true, role: true } },
            },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const isAdmin = project.creatorId === ownerId ||
            project.members.some((member) => member.userId === ownerId && member.role === 'ADMIN');
        if (!isAdmin) {
            throw new common_1.ForbiddenException('Only project admins can assign members');
        }
        await this.prisma.projectMember.upsert({
            where: { projectId_userId: { projectId: project.id, userId: colleague.contactId } },
            create: { projectId: project.id, userId: colleague.contactId, role: 'MEMBER' },
            update: {},
        });
        const refreshed = await this.prisma.colleague.findUnique({
            where: { id: colleague.id },
            include: this.colleagueInclude,
        });
        return this.buildColleagueResponse(ownerId, refreshed);
    }
    async assignTask(ownerId, colleagueId, dto) {
        let colleague = await this.ensureColleague(ownerId, colleagueId);
        if (!colleague.contactId) {
            throw new common_1.BadRequestException('Colleague has not registered yet');
        }
        const task = await this.prisma.task.findUnique({
            where: { id: dto.taskId },
            include: {
                project: {
                    include: {
                        members: { select: { userId: true, role: true } },
                    },
                },
            },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        const project = task.project;
        const isAdmin = project.creatorId === ownerId ||
            project.members.some((member) => member.userId === ownerId && member.role === 'ADMIN');
        if (!isAdmin) {
            throw new common_1.ForbiddenException('Only project admins can assign tasks');
        }
        const updatedTask = await this.prisma.task.update({
            where: { id: task.id },
            data: { assignedToId: colleague.contactId },
            select: {
                id: true,
                title: true,
                projectId: true,
                status: true,
                deadline: true,
                assignedTo: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        const refreshed = await this.prisma.colleague.findUnique({
            where: { id: colleague.id },
            include: this.colleagueInclude,
        });
        const response = await this.buildColleagueResponse(ownerId, refreshed);
        return { ...response, lastAssignedTask: updatedTask };
    }
    async ensureColleague(ownerId, colleagueId) {
        let colleague = await this.prisma.colleague.findFirst({
            where: { id: colleagueId, ownerId },
            include: this.colleagueInclude,
        });
        if (!colleague)
            throw new common_1.NotFoundException('Colleague not found');
        return colleague;
    }
    async ensureDefaultLists(ownerId) {
        const existing = await this.prisma.colleagueList.findMany({
            where: { ownerId },
            include: {
                members: {
                    include: {
                        colleague: {
                            include: {
                                contact: {
                                    select: { id: true, email: true, name: true, role: true },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        const names = new Set(existing.map((list) => list.name));
        const toCreate = DEFAULT_LISTS.filter((name) => !names.has(name));
        if (toCreate.length) {
            const created = await Promise.all(toCreate.map((name) => this.prisma.colleagueList.create({
                data: { ownerId, name },
                include: {
                    members: {
                        include: {
                            colleague: {
                                include: {
                                    contact: {
                                        select: { id: true, email: true, name: true, role: true },
                                    },
                                },
                            },
                        },
                    },
                },
            })));
            return [...existing, ...created];
        }
        return existing;
    }
    normalizeListIds(listIds) {
        if (!listIds || listIds.length === 0)
            return [];
        const normalized = listIds
            .map((value) => Number(value))
            .filter((value) => Number.isInteger(value) && value > 0);
        return Array.from(new Set(normalized));
    }
    mapList(list) {
        return {
            id: list.id,
            name: list.name,
            createdAt: list.createdAt,
            updatedAt: list.updatedAt,
            members: (list.members ?? []).map((member) => ({
                id: member.id,
                colleagueId: member.colleagueId,
                colleague: member.colleague
                    ? {
                        id: member.colleague.id,
                        email: member.colleague.email,
                        contact: member.colleague.contact
                            ? {
                                id: member.colleague.contact.id,
                                email: member.colleague.contact.email,
                                name: member.colleague.contact.name,
                                role: member.colleague.contact.role,
                            }
                            : null,
                    }
                    : null,
            })),
        };
    }
    async buildColleagueResponse(ownerId, colleague) {
        const base = {
            id: colleague.id,
            email: colleague.email,
            createdAt: colleague.createdAt,
            updatedAt: colleague.updatedAt,
            contact: colleague.contact
                ? {
                    id: colleague.contact.id,
                    email: colleague.contact.email,
                    name: colleague.contact.name,
                    role: colleague.contact.role,
                }
                : null,
            lists: (colleague.listMemberships ?? []).map((member) => ({
                id: member.list.id,
                name: member.list.name,
            })),
        };
        if (!colleague.contactId) {
            return { ...base, assignedProjects: [], assignedTasks: [] };
        }
        const [assignedProjects, assignedTasks] = await Promise.all([
            this.prisma.project.findMany({
                where: {
                    members: { some: { userId: colleague.contactId } },
                    OR: [
                        { creatorId: ownerId },
                        { members: { some: { userId: ownerId, role: 'ADMIN' } } },
                    ],
                },
                select: { id: true, name: true },
            }),
            this.prisma.task.findMany({
                where: {
                    assignedToId: colleague.contactId,
                    project: {
                        OR: [
                            { creatorId: ownerId },
                            { members: { some: { userId: ownerId, role: 'ADMIN' } } },
                        ],
                    },
                },
                select: { id: true, title: true, projectId: true },
            }),
        ]);
        return { ...base, assignedProjects, assignedTasks };
    }
};
exports.ColleaguesService = ColleaguesService;
exports.ColleaguesService = ColleaguesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ColleaguesService);
//# sourceMappingURL=colleagues.service.js.map