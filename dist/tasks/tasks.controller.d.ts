export declare class TasksController {
    getTasks(): Promise<{
        id: number;
        title: string;
        description: string;
    }[]>;
    createTask(task: {
        title: string;
        description: string;
    }): Promise<{
        title: string;
        description: string;
        id: number;
    }>;
}
