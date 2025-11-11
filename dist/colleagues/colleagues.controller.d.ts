import { ColleaguesService } from './colleagues.service';
import { CreateColleagueDto } from './dto/create-colleague.dto';
import { AssignProjectDto } from './dto/assign-project.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateListDto } from './dto/create-list.dto';
import { AddToListDto } from './dto/add-to-list.dto';
export declare class ColleaguesController {
    private readonly colleagues;
    constructor(colleagues: ColleaguesService);
    list(req: any): Promise<({
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
    create(req: any, dto: CreateColleagueDto): Promise<{
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
    lists(req: any): Promise<{
        id: any;
        name: any;
        createdAt: any;
        updatedAt: any;
        members: any;
    }[]>;
    createList(req: any, dto: CreateListDto): Promise<{
        id: any;
        name: any;
        createdAt: any;
        updatedAt: any;
        members: any;
    }>;
    addToList(req: any, id: number, dto: AddToListDto): Promise<{
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
    deleteList(req: any, id: number): Promise<{
        deletedId: number;
    }>;
    removeFromList(req: any, id: number, colleagueId: number): Promise<{
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
    assignProject(req: any, id: number, dto: AssignProjectDto): Promise<{
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
    assignTask(req: any, id: number, dto: AssignTaskDto): Promise<{
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
}
