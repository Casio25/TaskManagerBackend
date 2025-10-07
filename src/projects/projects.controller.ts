import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateProjectInviteDto } from './dto/create-project-invite.dto';
import { AcceptProjectInviteDto } from './dto/accept-project-invite.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { MailService } from '../mail/mail.service';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projects: ProjectsService, private mail: MailService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateProjectDto) {
    return this.projects.createProject(req.user.id, dto);
  }

  @Post(':id/invitations')
  async invite(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProjectInviteDto,
  ) {
    const { invite, token } = await this.projects.createInvite(id, req.user.id, dto);
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const link = `${appUrl}/projects/invitations/accept?token=${encodeURIComponent(token)}`;
    await this.mail.sendMail(
      dto.email,
      'Project invitation',
      `<p>You have been invited to join project <b>${id}</b>.</p><p>Follow the link: <a href="${link}">${link}</a></p>`,
    );
    return { invite, link };
  }

  @Post('invitations/accept')
  async accept(@Req() req: any, @Body() dto: AcceptProjectInviteDto) {
    return this.projects.acceptInvite(req.user.id, req.user.email, dto);
  }

  @Get('mine')
  async mine(@Req() req: any) {
    return this.projects.myProjects(req.user.id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectStatusDto,
  ) {
    return this.projects.updateProjectStatus(req.user.id, id, dto.status);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.projects.deleteProject(req.user.id, id);
  }
}
