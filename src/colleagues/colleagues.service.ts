import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProjectStatus, RatingScope, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColleagueDto } from './dto/create-colleague.dto';
import { AssignProjectDto } from './dto/assign-project.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateListDto } from './dto/create-list.dto';
import { AddToListDto } from './dto/add-to-list.dto';

const DEFAULT_LISTS = ['Favorites', 'Team 1', 'Team 2'];

@Injectable()
export class ColleaguesService {
  constructor(private readonly prisma: PrismaService) {}

  private colleagueInclude = {
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
  } as const;

  async list(ownerId: number) {
    await this.ensureDefaultLists(ownerId);
    const colleagues = await this.prisma.colleague.findMany({
      where: { ownerId },
      include: this.colleagueInclude,
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(colleagues.map((colleague) => this.buildColleagueResponse(ownerId, colleague)));
  }

  async create(ownerId: number, dto: CreateColleagueDto) {
    await this.ensureDefaultLists(ownerId);
    const listIds = this.normalizeListIds(dto.listIds);
    const email = dto.email.trim().toLowerCase();
    const owner = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) throw new NotFoundException('User not found');
    if (email === owner.email.toLowerCase()) {
      throw new BadRequestException('Cannot add yourself as a colleague');
    }

    const exists = await this.prisma.colleague.findUnique({
      where: { ownerId_email: { ownerId, email } },
    });
    if (exists) {
      throw new BadRequestException('Colleague already added');
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
        await this.prisma.$transaction(
          ownerLists.map((list) =>
            this.prisma.colleagueListMember.upsert({
              where: { listId_colleagueId: { listId: list.id, colleagueId: colleague.id } },
              update: {},
              create: { listId: list.id, colleagueId: colleague.id },
            }),
          ),
        );
        colleague =
          (await this.prisma.colleague.findUnique({
            where: { id: colleague.id },
            include: this.colleagueInclude,
          })) ?? colleague;
      }
    }

    return this.buildColleagueResponse(ownerId, colleague);


  }

  async listLists(ownerId: number) {
    const lists = await this.ensureDefaultLists(ownerId);
    return lists.map((list) => this.mapList(list));
  }

  async createList(ownerId: number, dto: CreateListDto) {
    const name = dto.name.trim();
    if (!name) throw new BadRequestException('List name is required');

    const existing = await this.prisma.colleagueList.findUnique({
      where: { ownerId_name: { ownerId, name } },
    });
    if (existing) {
      throw new BadRequestException('List with this name already exists');
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

  async addToList(ownerId: number, listId: number, dto: AddToListDto) {
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
    if (!list) throw new NotFoundException('List not found');

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
      list: this.mapList(updatedList!),
      colleague: await this.buildColleagueResponse(ownerId, refreshedColleague!),
    };
  }

  async deleteList(ownerId: number, listId: number) {
    const list = await this.prisma.colleagueList.findFirst({
      where: { id: listId, ownerId },
    });
    if ( !list) throw new NotFoundException( 'List not found');

    await this.prisma. $transaction(async (tx) => { 
      await tx.colleagueListMember.deleteMany({ where: { listId } });
      await tx.colleagueList.delete({ where: { id: listId } });
    });

    await this.ensureDefaultLists(ownerId);

    return { deletedId: listId };
  }


  async removeFromList(ownerId: number, listId: number, colleagueId: number) {
    const list = await this.prisma.colleagueList.findFirst({
      where: { id: listId, ownerId },
    });
    if (!list) throw new NotFoundException('List not found');

    const colleague = await this.ensureColleague(ownerId, colleagueId);

    const membership = await this.prisma.colleagueListMember.findUnique({
      where: { listId_colleagueId: { listId, colleagueId } },
    });
    if (!membership) {
      throw new NotFoundException('Colleague is not in this list');
    }

    await this.prisma.colleagueListMember.delete({
      where: { listId_colleagueId: { listId, colleagueId } },
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
      list: this.mapList(updatedList!),
      colleague: await this.buildColleagueResponse(ownerId, refreshedColleague!),
    };
  }

  async assignProject(ownerId: number, colleagueId: number, dto: AssignProjectDto) {
    let colleague = await this.ensureColleague(ownerId, colleagueId);
    if (!colleague.contactId) {
      throw new BadRequestException('Colleague has not registered yet');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: {
        members: { select: { userId: true, role: true } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');

    const isAdmin =
      project.creatorId === ownerId ||
      project.members.some((member) => member.userId === ownerId && member.role === 'ADMIN');
    if (!isAdmin) {
      throw new ForbiddenException('Only project admins can assign members');
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

    return this.buildColleagueResponse(ownerId, refreshed!);
  }

  async assignTask(ownerId: number, colleagueId: number, dto: AssignTaskDto) {
    let colleague = await this.ensureColleague(ownerId, colleagueId);
    if (!colleague.contactId) {
      throw new BadRequestException('Colleague has not registered yet');
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
    if (!task) throw new NotFoundException('Task not found');

    const project = task.project;
    const isAdmin =
      project.creatorId === ownerId ||
      project.members.some((member) => member.userId === ownerId && member.role === 'ADMIN');
    if (!isAdmin) {
      throw new ForbiddenException('Only project admins can assign tasks');
    }

    await this.prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: project.id, userId: colleague.contactId } },
      create: { projectId: project.id, userId: colleague.contactId, role: 'MEMBER' },
      update: {},
    });

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

    const response = await this.buildColleagueResponse(ownerId, refreshed!);
    return { ...response, lastAssignedTask: updatedTask };
  }

  private async ensureColleague(ownerId: number, colleagueId: number) {
    let colleague = await this.prisma.colleague.findFirst({
      where: { id: colleagueId, ownerId },
      include: this.colleagueInclude,
    });
    if (!colleague) throw new NotFoundException('Colleague not found');
    return colleague;
  }

  private async ensureDefaultLists(ownerId: number) {
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

    if (existing.length > 0) {
      return existing;
    }

    const created = await Promise.all(
      DEFAULT_LISTS.map((name) =>
        this.prisma.colleagueList.create({
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
        }),
      ),
    );

    return created;
  }

  private normalizeListIds(listIds?: ReadonlyArray<number | string>) {
    if (!listIds || listIds.length === 0) return [];
    const normalized = listIds
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0);
    return Array.from(new Set(normalized));
  }

  private mapList(list: any) {
    return {
      id: list.id,
      name: list.name,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      members: (list.members ?? []).map((member: any) => ({
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

  private async buildColleagueResponse(ownerId: number, colleague: any) {
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
      lists: (colleague.listMemberships ?? []).map((member: any) => ({
        id: member.list.id,
        name: member.list.name,
      })),
    };

    if (!colleague.contactId) {
      return { ...base, assignedProjects: [], assignedTasks: [] };
    }

    const accessibleProjectWhere: Prisma.ProjectWhereInput = {
      OR: [
        { creatorId: ownerId },
        { members: { some: { userId: ownerId, role: 'ADMIN' } } },
      ],
    };

    const [assignedProjects, assignedTasks, completedProjects, completedTasksCount] = await Promise.all([
      this.prisma.project.findMany({
        where: {
          ...accessibleProjectWhere,
          members: { some: { userId: colleague.contactId } },
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
      this.prisma.project.findMany({
        where: {
          ...accessibleProjectWhere,
          status: ProjectStatus.COMPLETED,
          members: { some: { userId: colleague.contactId } },
        },
        select: {
          id: true,
          name: true,
          deadline: true,
          completedAt: true,
          color: true,
          ratings: {
            where: {
              scope: RatingScope.PROJECT,
              userId: colleague.contactId,
            },
            select: {
              id: true,
              punctuality: true,
              teamwork: true,
              quality: true,
              comments: true,
              createdAt: true,
              updatedAt: true,
              ratedBy: {
                select: { id: true, name: true, email: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: [{ completedAt: 'desc' }, { updatedAt: 'desc' }],
      }),
      this.prisma.task.count({
        where: {
          status: TaskStatus.COMPLETED,
          assignedToId: colleague.contactId,
          project: {
            OR: [
              { creatorId: ownerId },
              { members: { some: { userId: ownerId, role: 'ADMIN' } } },
            ],
          },
        },
      }),
    ]);

    const pendingProjectRatings = completedProjects
      .filter((project) => project.ratings.length === 0)
      .map((project) => ({
        projectId: project.id,
        projectName: project.name,
        deadline: project.deadline,
        completedAt: project.completedAt,
        color: project.color,
      }));

    const projectRatings = completedProjects
      .map((project) => {
        const rating = project.ratings[0];
        if (!rating) return null;
        return {
          projectId: project.id,
          projectName: project.name,
          deadline: project.deadline,
          completedAt: project.completedAt,
          color: project.color,
          rating: {
            id: rating.id,
            punctuality: rating.punctuality,
            teamwork: rating.teamwork,
            quality: rating.quality,
            comments: rating.comments,
            createdAt: rating.createdAt,
            updatedAt: rating.updatedAt,
            ratedBy: rating.ratedBy
              ? {
                  id: rating.ratedBy.id,
                  name: rating.ratedBy.name,
                  email: rating.ratedBy.email,
                }
              : null,
          },
        };
      })
      .filter((value): value is NonNullable<typeof value> => value !== null);

    const ratingValues = projectRatings.map((entry) => entry.rating);
    const ratingCount = ratingValues.length;
    const projectRatingAverages = ratingCount
      ? {
          count: ratingCount,
          punctuality:
            ratingValues.reduce((total, rating) => total + rating.punctuality, 0) / ratingCount,
          teamwork:
            ratingValues.reduce((total, rating) => total + rating.teamwork, 0) / ratingCount,
          quality:
            ratingValues.reduce((total, rating) => total + rating.quality, 0) / ratingCount,
        }
      : null;

    return {
      ...base,
      assignedProjects,
      assignedTasks,
      pendingProjectRatings,
      projectRatings,
      completedProjects: completedProjects.length,
      completedTasks: completedTasksCount,
      projectRatingAverages,
    };
  }
}




