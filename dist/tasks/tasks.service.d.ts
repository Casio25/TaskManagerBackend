import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private ensureProjectMember;
    private isAdmin;
    createTask(userId: number, dto: CreateTaskDto): Promise<{
        project: {
            description: string | null;
            deadline: Date | null;
            id: number;
            name: string;
            creatorId: number;
            groupId: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
        theme: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        ratings: {
            projectId: number | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number | null;
            quality: number;
            timeliness: number;
            comments: string | null;
            taskId: number | null;
        }[];
        _count: {
            project: number;
            parentTask: number;
            subTasks: number;
            assignedTo: number;
            assignedGroup: number;
            theme: number;
            submissions: number;
            tags: number;
            ratings: number;
        };
        assignedTo: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            role: import(".prisma/client").$Enums.Role;
            email: string;
            password: string;
        } | null;
        submissions: {
            status: import(".prisma/client").$Enums.SubmissionStatus;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            taskId: number;
            type: import(".prisma/client").$Enums.SubmissionType;
            content: string | null;
            ratingId: number | null;
        }[];
        assignedGroup: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            adminId: number;
        } | null;
        parentTask: {
            title: string;
            description: string | null;
            projectId: number;
            assignedToId: number | null;
            assignedGroupId: number | null;
            parentTaskId: number | null;
            themeId: number | null;
            status: import(".prisma/client").$Enums.TaskStatus;
            deadline: Date | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        subTasks: {
            title: string;
            description: string | null;
            projectId: number;
            assignedToId: number | null;
            assignedGroupId: number | null;
            parentTaskId: number | null;
            themeId: number | null;
            status: import(".prisma/client").$Enums.TaskStatus;
            deadline: Date | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        tags: {
            id: number;
            taskId: number;
            tagId: number;
        }[];
    } & {
        title: string;
        description: string | null;
        projectId: number;
        assignedToId: number | null;
        assignedGroupId: number | null;
        parentTaskId: number | null;
        themeId: number | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        deadline: Date | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateTask(userId: number, taskId: number, dto: UpdateTaskDto): Promise<{
        project: {
            description: string | null;
            deadline: Date | null;
            id: number;
            name: string;
            creatorId: number;
            groupId: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
        theme: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        ratings: {
            projectId: number | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number | null;
            quality: number;
            timeliness: number;
            comments: string | null;
            taskId: number | null;
        }[];
        _count: {
            project: number;
            parentTask: number;
            subTasks: number;
            assignedTo: number;
            assignedGroup: number;
            theme: number;
            submissions: number;
            tags: number;
            ratings: number;
        };
        assignedTo: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            role: import(".prisma/client").$Enums.Role;
            email: string;
            password: string;
        } | null;
        submissions: {
            status: import(".prisma/client").$Enums.SubmissionStatus;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            taskId: number;
            type: import(".prisma/client").$Enums.SubmissionType;
            content: string | null;
            ratingId: number | null;
        }[];
        assignedGroup: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            adminId: number;
        } | null;
        parentTask: {
            title: string;
            description: string | null;
            projectId: number;
            assignedToId: number | null;
            assignedGroupId: number | null;
            parentTaskId: number | null;
            themeId: number | null;
            status: import(".prisma/client").$Enums.TaskStatus;
            deadline: Date | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        subTasks: {
            title: string;
            description: string | null;
            projectId: number;
            assignedToId: number | null;
            assignedGroupId: number | null;
            parentTaskId: number | null;
            themeId: number | null;
            status: import(".prisma/client").$Enums.TaskStatus;
            deadline: Date | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        tags: {
            id: number;
            taskId: number;
            tagId: number;
        }[];
    } & {
        title: string;
        description: string | null;
        projectId: number;
        assignedToId: number | null;
        assignedGroupId: number | null;
        parentTaskId: number | null;
        themeId: number | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        deadline: Date | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listProjectTasks(userId: number, projectId: number): Promise<({
        project: {
            description: string | null;
            deadline: Date | null;
            id: number;
            name: string;
            creatorId: number;
            groupId: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
        theme: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        ratings: {
            projectId: number | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number | null;
            quality: number;
            timeliness: number;
            comments: string | null;
            taskId: number | null;
        }[];
        _count: {
            project: number;
            parentTask: number;
            subTasks: number;
            assignedTo: number;
            assignedGroup: number;
            theme: number;
            submissions: number;
            tags: number;
            ratings: number;
        };
        assignedTo: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            role: import(".prisma/client").$Enums.Role;
            email: string;
            password: string;
        } | null;
        submissions: {
            status: import(".prisma/client").$Enums.SubmissionStatus;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            taskId: number;
            type: import(".prisma/client").$Enums.SubmissionType;
            content: string | null;
            ratingId: number | null;
        }[];
        assignedGroup: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            adminId: number;
        } | null;
        parentTask: {
            title: string;
            description: string | null;
            projectId: number;
            assignedToId: number | null;
            assignedGroupId: number | null;
            parentTaskId: number | null;
            themeId: number | null;
            status: import(".prisma/client").$Enums.TaskStatus;
            deadline: Date | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        subTasks: {
            title: string;
            description: string | null;
            projectId: number;
            assignedToId: number | null;
            assignedGroupId: number | null;
            parentTaskId: number | null;
            themeId: number | null;
            status: import(".prisma/client").$Enums.TaskStatus;
            deadline: Date | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        tags: {
            id: number;
            taskId: number;
            tagId: number;
        }[];
    } & {
        title: string;
        description: string | null;
        projectId: number;
        assignedToId: number | null;
        assignedGroupId: number | null;
        parentTaskId: number | null;
        themeId: number | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        deadline: Date | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    listUserTasks(userId: number): Promise<({
        project: {
            description: string | null;
            deadline: Date | null;
            id: number;
            name: string;
            creatorId: number;
            groupId: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
        theme: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        ratings: {
            projectId: number | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number | null;
            quality: number;
            timeliness: number;
            comments: string | null;
            taskId: number | null;
        }[];
        _count: {
            project: number;
            parentTask: number;
            subTasks: number;
            assignedTo: number;
            assignedGroup: number;
            theme: number;
            submissions: number;
            tags: number;
            ratings: number;
        };
        assignedTo: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            role: import(".prisma/client").$Enums.Role;
            email: string;
            password: string;
        } | null;
        submissions: {
            status: import(".prisma/client").$Enums.SubmissionStatus;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            taskId: number;
            type: import(".prisma/client").$Enums.SubmissionType;
            content: string | null;
            ratingId: number | null;
        }[];
        assignedGroup: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            adminId: number;
        } | null;
        parentTask: {
            title: string;
            description: string | null;
            projectId: number;
            assignedToId: number | null;
            assignedGroupId: number | null;
            parentTaskId: number | null;
            themeId: number | null;
            status: import(".prisma/client").$Enums.TaskStatus;
            deadline: Date | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        subTasks: {
            title: string;
            description: string | null;
            projectId: number;
            assignedToId: number | null;
            assignedGroupId: number | null;
            parentTaskId: number | null;
            themeId: number | null;
            status: import(".prisma/client").$Enums.TaskStatus;
            deadline: Date | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        tags: {
            id: number;
            taskId: number;
            tagId: number;
        }[];
    } & {
        title: string;
        description: string | null;
        projectId: number;
        assignedToId: number | null;
        assignedGroupId: number | null;
        parentTaskId: number | null;
        themeId: number | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        deadline: Date | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    private taskInclude;
}
