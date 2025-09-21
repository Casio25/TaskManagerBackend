import { ProjectTaskDto } from './project-task.dto';
export declare class CreateProjectDto {
    name: string;
    description?: string;
    color?: string;
    groupId?: number;
    deadline: string;
    tasks: ProjectTaskDto[];
}
