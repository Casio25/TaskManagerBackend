import { CalendarService } from './calendar.service';
export declare class CalendarController {
    private readonly calendar;
    constructor(calendar: CalendarService);
    myCalendar(req: any, query: any): Promise<({
        project: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            color: string;
            creatorId: number;
            groupId: number | null;
            deadline: Date | null;
            status: import(".prisma/client").$Enums.ProjectStatus;
            completedAt: Date | null;
            completedById: number | null;
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
            submittedBy: number;
            completedBy: number;
            submissions: number;
            tags: number;
            ratings: number;
        };
        submissions: {
            taskId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SubmissionStatus;
            userId: number;
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
            userId: number;
            punctuality: number;
            teamwork: number;
            quality: number;
            comments: string | null;
            scope: import(".prisma/client").$Enums.RatingScope;
            ratedById: number;
        }[];
        completedBy: {
            email: string;
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            password: string;
            role: import(".prisma/client").$Enums.Role;
        } | null;
        parentTask: {
            projectId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            deadline: Date | null;
            status: import(".prisma/client").$Enums.TaskStatus;
            completedAt: Date | null;
            completedById: number | null;
            title: string;
            parentTaskId: number | null;
            assignedToId: number | null;
            assignedGroupId: number | null;
            themeId: number | null;
            submittedAt: Date | null;
            submittedById: number | null;
        } | null;
        subTasks: {
            projectId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            deadline: Date | null;
            status: import(".prisma/client").$Enums.TaskStatus;
            completedAt: Date | null;
            completedById: number | null;
            title: string;
            parentTaskId: number | null;
            assignedToId: number | null;
            assignedGroupId: number | null;
            themeId: number | null;
            submittedAt: Date | null;
            submittedById: number | null;
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
        submittedBy: {
            email: string;
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            password: string;
            role: import(".prisma/client").$Enums.Role;
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
        status: import(".prisma/client").$Enums.TaskStatus;
        completedAt: Date | null;
        completedById: number | null;
        title: string;
        parentTaskId: number | null;
        assignedToId: number | null;
        assignedGroupId: number | null;
        themeId: number | null;
        submittedAt: Date | null;
        submittedById: number | null;
    })[]>;
    projectCalendar(req: any, id: number, query: any): Promise<({
        project: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            color: string;
            creatorId: number;
            groupId: number | null;
            deadline: Date | null;
            status: import(".prisma/client").$Enums.ProjectStatus;
            completedAt: Date | null;
            completedById: number | null;
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
            submittedBy: number;
            completedBy: number;
            submissions: number;
            tags: number;
            ratings: number;
        };
        submissions: {
            taskId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SubmissionStatus;
            userId: number;
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
            userId: number;
            punctuality: number;
            teamwork: number;
            quality: number;
            comments: string | null;
            scope: import(".prisma/client").$Enums.RatingScope;
            ratedById: number;
        }[];
        completedBy: {
            email: string;
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            password: string;
            role: import(".prisma/client").$Enums.Role;
        } | null;
        parentTask: {
            projectId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            deadline: Date | null;
            status: import(".prisma/client").$Enums.TaskStatus;
            completedAt: Date | null;
            completedById: number | null;
            title: string;
            parentTaskId: number | null;
            assignedToId: number | null;
            assignedGroupId: number | null;
            themeId: number | null;
            submittedAt: Date | null;
            submittedById: number | null;
        } | null;
        subTasks: {
            projectId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            deadline: Date | null;
            status: import(".prisma/client").$Enums.TaskStatus;
            completedAt: Date | null;
            completedById: number | null;
            title: string;
            parentTaskId: number | null;
            assignedToId: number | null;
            assignedGroupId: number | null;
            themeId: number | null;
            submittedAt: Date | null;
            submittedById: number | null;
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
        submittedBy: {
            email: string;
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            password: string;
            role: import(".prisma/client").$Enums.Role;
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
        status: import(".prisma/client").$Enums.TaskStatus;
        completedAt: Date | null;
        completedById: number | null;
        title: string;
        parentTaskId: number | null;
        assignedToId: number | null;
        assignedGroupId: number | null;
        themeId: number | null;
        submittedAt: Date | null;
        submittedById: number | null;
    })[]>;
}
