import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ColleaguesService } from './colleagues.service';
import { CreateColleagueDto } from './dto/create-colleague.dto';
import { AssignProjectDto } from './dto/assign-project.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateListDto } from './dto/create-list.dto';
import { AddToListDto } from './dto/add-to-list.dto';

@UseGuards(JwtAuthGuard)
@Controller('colleagues')
export class ColleaguesController {
  constructor(private readonly colleagues: ColleaguesService) {}

  @Get()
  list(@Req() req: any) {
    return this.colleagues.list(req.user.id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateColleagueDto) {
    return this.colleagues.create(req.user.id, dto);
  }

  @Get('lists')
  lists(@Req() req: any) {
    return this.colleagues.listLists(req.user.id);
  }

  @Post('lists')
  createList(@Req() req: any, @Body() dto: CreateListDto) {
    return this.colleagues.createList(req.user.id, dto);
  }

  @Post('lists/:id/members')
  addToList(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddToListDto,
  ) {
    return this.colleagues.addToList(req.user.id, id, dto);
  }

  @Delete('lists/:id')
  deleteList(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.colleagues.deleteList(req.user.id, id);
  }

  @Delete('lists/:id/members/:colleagueId')
  removeFromList(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('colleagueId', ParseIntPipe) colleagueId: number,
  ) {
    return this.colleagues.removeFromList(req.user.id, id, colleagueId);
  }

  @Post(':id/assign-project')
  assignProject(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignProjectDto,
  ) {
    return this.colleagues.assignProject(req.user.id, id, dto);
  }

  @Post(':id/assign-task')
  assignTask(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignTaskDto,
  ) {
    return this.colleagues.assignTask(req.user.id, id, dto);
  }
}
