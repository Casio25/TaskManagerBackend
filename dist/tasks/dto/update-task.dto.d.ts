import { TaskStatus } from '@prisma/client';
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    deadline?: string | null;
    assignedToId?: number | null;
    assignedGroupId?: number | null;
    themeId?: number | null;
}
