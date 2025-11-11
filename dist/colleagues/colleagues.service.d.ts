import { PrismaService } from '../prisma/prisma.service';
import { CreateColleagueDto } from './dto/create-colleague.dto';
import { AssignProjectDto } from './dto/assign-project.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateListDto } from './dto/create-list.dto';
import { AddToListDto } from './dto/add-to-list.dto';
export declare class ColleaguesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private colleagueInclude;
    list(ownerId: number): Promise<({
        assignedProjects: never[];
        assignedTasks: never[];
        id: any;
        email: any;
        createdAt: any;
        updatedAt: any;
        contact: {
            id: any;
            email: any;
            name: any;
            role: any;
        } | null;
        lists: any;
    } | {
        assignedProjects: {
            name: string;
            id: number;
        }[];
        assignedTasks: {
            projectId: number;
            id: number;
            title: string;
        }[];
        pendingProjectRatings: {
            projectId: number;
            projectName: string;
            deadline: Date | null;
            completedAt: Date | null;
            color: string;
        }[];
        projectRatings: {
            projectId: number;
            projectName: string;
            deadline: Date | null;
            completedAt: Date | null;
            color: string;
            rating: {
                id: number;
                punctuality: number;
                teamwork: number;
                quality: number;
                comments: string | null;
                createdAt: Date;
                updatedAt: Date;
                ratedBy: {
                    id: number;
                    name: string;
                    email: string;
                } | null;
            };
        }[];
        completedProjects: number;
        completedTasks: number;
        projectRatingAverages: {
            count: number;
            punctuality: number;
            teamwork: number;
            quality: number;
        } | null;
        id: any;
        email: any;
        createdAt: any;
        updatedAt: any;
        contact: {
            id: any;
            email: any;
            name: any;
            role: any;
        } | null;
        lists: any;
    })[]>;
    create(ownerId: number, dto: CreateColleagueDto): Promise<{
        assignedProjects: never[];
        assignedTasks: never[];
        id: any;
        email: any;
        createdAt: any;
        updatedAt: any;
        contact: {
            id: any;
            email: any;
            name: any;
            role: any;
        } | null;
        lists: any;
    } | {
        assignedProjects: {
            name: string;
            id: number;
        }[];
        assignedTasks: {
            projectId: number;
            id: number;
            title: string;
        }[];
        pendingProjectRatings: {
            projectId: number;
            projectName: string;
            deadline: Date | null;
            completedAt: Date | null;
            color: string;
        }[];
        projectRatings: {
            projectId: number;
            projectName: string;
            deadline: Date | null;
            completedAt: Date | null;
            color: string;
            rating: {
                id: number;
                punctuality: number;
                teamwork: number;
                quality: number;
                comments: string | null;
                createdAt: Date;
                updatedAt: Date;
                ratedBy: {
                    id: number;
                    name: string;
                    email: string;
                } | null;
            };
        }[];
        completedProjects: number;
        completedTasks: number;
        projectRatingAverages: {
            count: number;
            punctuality: number;
            teamwork: number;
            quality: number;
        } | null;
        id: any;
        email: any;
        createdAt: any;
        updatedAt: any;
        contact: {
            id: any;
            email: any;
            name: any;
            role: any;
        } | null;
        lists: any;
    }>;
    listLists(ownerId: number): Promise<{
        id: any;
        name: any;
        createdAt: any;
        updatedAt: any;
        members: any;
    }[]>;
    createList(ownerId: number, dto: CreateListDto): Promise<{
        id: any;
        name: any;
        createdAt: any;
        updatedAt: any;
        members: any;
    }>;
    addToList(ownerId: number, listId: number, dto: AddToListDto): Promise<{
        list: {
            id: any;
            name: any;
            createdAt: any;
            updatedAt: any;
            members: any;
        };
        colleague: {
            assignedProjects: never[];
            assignedTasks: never[];
            id: any;
            email: any;
            createdAt: any;
            updatedAt: any;
            contact: {
                id: any;
                email: any;
                name: any;
                role: any;
            } | null;
            lists: any;
        } | {
            assignedProjects: {
                name: string;
                id: number;
            }[];
            assignedTasks: {
                projectId: number;
                id: number;
                title: string;
            }[];
            pendingProjectRatings: {
                projectId: number;
                projectName: string;
                deadline: Date | null;
                completedAt: Date | null;
                color: string;
            }[];
            projectRatings: {
                projectId: number;
                projectName: string;
                deadline: Date | null;
                completedAt: Date | null;
                color: string;
                rating: {
                    id: number;
                    punctuality: number;
                    teamwork: number;
                    quality: number;
                    comments: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    ratedBy: {
                        id: number;
                        name: string;
                        email: string;
                    } | null;
                };
            }[];
            completedProjects: number;
            completedTasks: number;
            projectRatingAverages: {
                count: number;
                punctuality: number;
                teamwork: number;
                quality: number;
            } | null;
            id: any;
            email: any;
            createdAt: any;
            updatedAt: any;
            contact: {
                id: any;
                email: any;
                name: any;
                role: any;
            } | null;
            lists: any;
        };
    }>;
    deleteList(ownerId: number, listId: number): Promise<{
        deletedId: number;
    }>;
    removeFromList(ownerId: number, listId: number, colleagueId: number): Promise<{
        list: {
            id: any;
            name: any;
            createdAt: any;
            updatedAt: any;
            members: any;
        };
        colleague: {
            assignedProjects: never[];
            assignedTasks: never[];
            id: any;
            email: any;
            createdAt: any;
            updatedAt: any;
            contact: {
                id: any;
                email: any;
                name: any;
                role: any;
            } | null;
            lists: any;
        } | {
            assignedProjects: {
                name: string;
                id: number;
            }[];
            assignedTasks: {
                projectId: number;
                id: number;
                title: string;
            }[];
            pendingProjectRatings: {
                projectId: number;
                projectName: string;
                deadline: Date | null;
                completedAt: Date | null;
                color: string;
            }[];
            projectRatings: {
                projectId: number;
                projectName: string;
                deadline: Date | null;
                completedAt: Date | null;
                color: string;
                rating: {
                    id: number;
                    punctuality: number;
                    teamwork: number;
                    quality: number;
                    comments: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    ratedBy: {
                        id: number;
                        name: string;
                        email: string;
                    } | null;
                };
            }[];
            completedProjects: number;
            completedTasks: number;
            projectRatingAverages: {
                count: number;
                punctuality: number;
                teamwork: number;
                quality: number;
            } | null;
            id: any;
            email: any;
            createdAt: any;
            updatedAt: any;
            contact: {
                id: any;
                email: any;
                name: any;
                role: any;
            } | null;
            lists: any;
        };
    }>;
    assignProject(ownerId: number, colleagueId: number, dto: AssignProjectDto): Promise<{
        assignedProjects: never[];
        assignedTasks: never[];
        id: any;
        email: any;
        createdAt: any;
        updatedAt: any;
        contact: {
            id: any;
            email: any;
            name: any;
            role: any;
        } | null;
        lists: any;
    } | {
        assignedProjects: {
            name: string;
            id: number;
        }[];
        assignedTasks: {
            projectId: number;
            id: number;
            title: string;
        }[];
        pendingProjectRatings: {
            projectId: number;
            projectName: string;
            deadline: Date | null;
            completedAt: Date | null;
            color: string;
        }[];
        projectRatings: {
            projectId: number;
            projectName: string;
            deadline: Date | null;
            completedAt: Date | null;
            color: string;
            rating: {
                id: number;
                punctuality: number;
                teamwork: number;
                quality: number;
                comments: string | null;
                createdAt: Date;
                updatedAt: Date;
                ratedBy: {
                    id: number;
                    name: string;
                    email: string;
                } | null;
            };
        }[];
        completedProjects: number;
        completedTasks: number;
        projectRatingAverages: {
            count: number;
            punctuality: number;
            teamwork: number;
            quality: number;
        } | null;
        id: any;
        email: any;
        createdAt: any;
        updatedAt: any;
        contact: {
            id: any;
            email: any;
            name: any;
            role: any;
        } | null;
        lists: any;
    }>;
    assignTask(ownerId: number, colleagueId: number, dto: AssignTaskDto): Promise<{
        lastAssignedTask: {
            projectId: number;
            id: number;
            deadline: Date | null;
            status: import(".prisma/client").$Enums.TaskStatus;
            title: string;
            assignedTo: {
                email: string;
                name: string;
                id: number;
            } | null;
        };
        assignedProjects: never[];
        assignedTasks: never[];
        id: any;
        email: any;
        createdAt: any;
        updatedAt: any;
        contact: {
            id: any;
            email: any;
            name: any;
            role: any;
        } | null;
        lists: any;
    } | {
        lastAssignedTask: {
            projectId: number;
            id: number;
            deadline: Date | null;
            status: import(".prisma/client").$Enums.TaskStatus;
            title: string;
            assignedTo: {
                email: string;
                name: string;
                id: number;
            } | null;
        };
        assignedProjects: {
            name: string;
            id: number;
        }[];
        assignedTasks: {
            projectId: number;
            id: number;
            title: string;
        }[];
        pendingProjectRatings: {
            projectId: number;
            projectName: string;
            deadline: Date | null;
            completedAt: Date | null;
            color: string;
        }[];
        projectRatings: {
            projectId: number;
            projectName: string;
            deadline: Date | null;
            completedAt: Date | null;
            color: string;
            rating: {
                id: number;
                punctuality: number;
                teamwork: number;
                quality: number;
                comments: string | null;
                createdAt: Date;
                updatedAt: Date;
                ratedBy: {
                    id: number;
                    name: string;
                    email: string;
                } | null;
            };
        }[];
        completedProjects: number;
        completedTasks: number;
        projectRatingAverages: {
            count: number;
            punctuality: number;
            teamwork: number;
            quality: number;
        } | null;
        id: any;
        email: any;
        createdAt: any;
        updatedAt: any;
        contact: {
            id: any;
            email: any;
            name: any;
            role: any;
        } | null;
        lists: any;
    }>;
    private ensureColleague;
    private ensureDefaultLists;
    private normalizeListIds;
    private mapList;
    private buildColleagueResponse;
}
