import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksController {
    private readonly tasks;
    constructor(tasks: TasksService);
    create(req: any, dto: CreateTaskDto): Promise<{
        project: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            creatorId: number;
            groupId: number | null;
            deadline: Date | null;
        };
        theme: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
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
        submissions: {
            taskId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            status: import(".prisma/client").$Enums.SubmissionStatus;
            type: import(".prisma/client").$Enums.SubmissionType;
            content: string | null;
            ratingId: number | null;
        }[];
        ratings: {
            projectId: number | null;
            taskId: number | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number | null;
            quality: number;
            timeliness: number;
            comments: string | null;
        }[];
        parentTask: {
            projectId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            deadline: Date | null;
            title: string;
            parentTaskId: number | null;
            assignedToId: number | null;
            assignedGroupId: number | null;
            themeId: number | null;
            status: import(".prisma/client").$Enums.TaskStatus;
        } | null;
        subTasks: {
            projectId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            deadline: Date | null;
            title: string;
            parentTaskId: number | null;
            assignedToId: number | null;
            assignedGroupId: number | null;
            themeId: number | null;
            status: import(".prisma/client").$Enums.TaskStatus;
        }[];
        assignedTo: {
            email: string;
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            password: string;
            role: import(".prisma/client").$Enums.Role;
        } | null;
        assignedGroup: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            adminId: number;
        } | null;
        tags: {
            taskId: number;
            id: number;
            tagId: number;
        }[];
    } & {
        projectId: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        deadline: Date | null;
        title: string;
        parentTaskId: number | null;
        assignedToId: number | null;
        assignedGroupId: number | null;
        themeId: number | null;
        status: import(".prisma/client").$Enums.TaskStatus;
    }>;
    update(req: any, id: number, dto: UpdateTaskDto): Promise<{
        project: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            creatorId: number;
            groupId: number | null;
            deadline: Date | null;
        };
        theme: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
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
        submissions: {
            taskId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            status: import(".prisma/client").$Enums.SubmissionStatus;
            type: import(".prisma/client").$Enums.SubmissionType;
            content: string | null;
            ratingId: number | null;
        }[];
        ratings: {
            projectId: number | null;
            taskId: number | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number | null;
            quality: number;
            timeliness: number;
            comments: string | null;
        }[];
        parentTask: {
            projectId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            deadline: Date | null;
            title: string;
            parentTaskId: number | null;
            assignedToId: number | null;
            assignedGroupId: number | null;
            themeId: number | null;
            status: import(".prisma/client").$Enums.TaskStatus;
        } | null;
        subTasks: {
            projectId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            deadline: Date | null;
            title: string;
            parentTaskId: number | null;
            assignedToId: number | null;
            assignedGroupId: number | null;
            themeId: number | null;
            status: import(".prisma/client").$Enums.TaskStatus;
        }[];
        assignedTo: {
            email: string;
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            password: string;
            role: import(".prisma/client").$Enums.Role;
        } | null;
        assignedGroup: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            adminId: number;
        } | null;
        tags: {
            taskId: number;
            id: number;
            tagId: number;
        }[];
    } & {
        projectId: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        deadline: Date | null;
        title: string;
        parentTaskId: number | null;
        assignedToId: number | null;
        assignedGroupId: number | null;
        themeId: number | null;
        status: import(".prisma/client").$Enums.TaskStatus;
    }>;
    byProject(req: any, id: number): Promise<({
        project: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            creatorId: number;
            groupId: number | null;
            deadline: Date | null;
        };
        theme: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
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
        submissions: {
            taskId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            status: import(".prisma/client").$Enums.SubmissionStatus;
            type: import(".prisma/client").$Enums.SubmissionType;
            content: string | null;
            ratingId: number | null;
        }[];
        ratings: {
            projectId: number | null;
            taskId: number | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number | null;
            quality: number;
            timeliness: number;
            comments: string | null;
        }[];
        parentTask: {
            projectId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            deadline: Date | null;
            title: string;
            parentTaskId: number | null;
            assignedToId: number | null;
            assignedGroupId: number | null;
            themeId: number | null;
            status: import(".prisma/client").$Enums.TaskStatus;
        } | null;
        subTasks: {
            projectId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            deadline: Date | null;
            title: string;
            parentTaskId: number | null;
            assignedToId: number | null;
            assignedGroupId: number | null;
            themeId: number | null;
            status: import(".prisma/client").$Enums.TaskStatus;
        }[];
        assignedTo: {
            email: string;
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            password: string;
            role: import(".prisma/client").$Enums.Role;
        } | null;
        assignedGroup: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            adminId: number;
        } | null;
        tags: {
            taskId: number;
            id: number;
            tagId: number;
        }[];
    } & {
        projectId: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        deadline: Date | null;
        title: string;
        parentTaskId: number | null;
        assignedToId: number | null;
        assignedGroupId: number | null;
        themeId: number | null;
        status: import(".prisma/client").$Enums.TaskStatus;
    })[]>;
    myTasks(req: any): Promise<({
        project: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            creatorId: number;
            groupId: number | null;
            deadline: Date | null;
        };
        theme: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
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
        submissions: {
            taskId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            status: import(".prisma/client").$Enums.SubmissionStatus;
            type: import(".prisma/client").$Enums.SubmissionType;
            content: string | null;
            ratingId: number | null;
        }[];
        ratings: {
            projectId: number | null;
            taskId: number | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number | null;
            quality: number;
            timeliness: number;
            comments: string | null;
        }[];
        parentTask: {
            projectId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            deadline: Date | null;
            title: string;
            parentTaskId: number | null;
            assignedToId: number | null;
            assignedGroupId: number | null;
            themeId: number | null;
            status: import(".prisma/client").$Enums.TaskStatus;
        } | null;
        subTasks: {
            projectId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            deadline: Date | null;
            title: string;
            parentTaskId: number | null;
            assignedToId: number | null;
            assignedGroupId: number | null;
            themeId: number | null;
            status: import(".prisma/client").$Enums.TaskStatus;
        }[];
        assignedTo: {
            email: string;
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            password: string;
            role: import(".prisma/client").$Enums.Role;
        } | null;
        assignedGroup: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            adminId: number;
        } | null;
        tags: {
            taskId: number;
            id: number;
            tagId: number;
        }[];
    } & {
        projectId: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        deadline: Date | null;
        title: string;
        parentTaskId: number | null;
        assignedToId: number | null;
        assignedGroupId: number | null;
        themeId: number | null;
        status: import(".prisma/client").$Enums.TaskStatus;
    })[]>;
}
