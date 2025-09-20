import { ColleaguesService } from './colleagues.service';
import { CreateColleagueDto } from './dto/create-colleague.dto';
import { AssignProjectDto } from './dto/assign-project.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateListDto } from './dto/create-list.dto';
import { AddToListDto } from './dto/add-to-list.dto';
export declare class ColleaguesController {
    private readonly colleagues;
    constructor(colleagues: ColleaguesService);
    list(req: any): Promise<{
        assignedProjects: {
            name: string;
            id: number;
        }[];
        assignedTasks: {
            projectId: number;
            id: number;
            title: string;
        }[];
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
    }[]>;
    create(req: any, dto: CreateColleagueDto): Promise<{
        assignedProjects: {
            name: string;
            id: number;
        }[];
        assignedTasks: {
            projectId: number;
            id: number;
            title: string;
        }[];
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
            assignedProjects: {
                name: string;
                id: number;
            }[];
            assignedTasks: {
                projectId: number;
                id: number;
                title: string;
            }[];
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
        assignedProjects: {
            name: string;
            id: number;
        }[];
        assignedTasks: {
            projectId: number;
            id: number;
            title: string;
        }[];
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
            title: string;
            status: import(".prisma/client").$Enums.TaskStatus;
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
