import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { RateTaskDto } from './dto/rate-task.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateTaskDto) {
    return this.tasks.createTask(req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.updateTask(req.user.id, id, dto);
  }

  @Post(':id/complete')
  complete(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.tasks.completeTask(req.user.id, id);
  }

  @Post(':id/reopen')
  reopen(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.tasks.reopenTask(req.user.id, id);
  }

  @Post(':id/rate')
  rate(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RateTaskDto,
  ) {
    return this.tasks.rateTask(req.user.id, id, dto);
  }

  @Get('project/:id')
  byProject(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.tasks.listProjectTasks(req.user.id, id);
  }

  @Get('my')
  myTasks(@Req() req: any) {
    return this.tasks.listUserTasks(req.user.id);
  }
}
