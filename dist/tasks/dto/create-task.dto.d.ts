import { TaskStatus } from '@prisma/client';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    projectId: number;
    assignedToId?: number;
    assignedGroupId?: number;
    parentTaskId?: number;
    themeId?: number;
    status?: TaskStatus;
    deadline?: string;
}
