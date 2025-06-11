import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('tasks')
export class TasksController {
    @Get()
    async getTasks() {
        return [
            {
                id: 1,
                title: 'Task 1',
                description: 'Description for Task 1',
            },
            {
                id: 2,
                title: 'Task 2',
                description: 'Description for Task 2',
            },
        ];
    }
    @Post('create')
    async createTask(@Body() task: { title: string; description: string }) {
        return {
            id: Math.floor(Math.random() * 1000),
            ...task,
        };
    }
}
