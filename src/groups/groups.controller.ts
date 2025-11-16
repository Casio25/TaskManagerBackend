import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateGroupDto } from './dto/create-group.dto';
import { CreateGroupInviteDto } from './dto/create-group-invite.dto';
import { AcceptGroupInviteDto } from './dto/accept-group-invite.dto';
import { MailService } from '../mail/mail.service';

@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(
    private groups: GroupsService,
    private mail: MailService,
  ) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateGroupDto) {
    return this.groups.createGroup(req.user.id, dto);
  }

  @Post(':id/invitations')
  async invite(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateGroupInviteDto,
  ) {
    const { invite, token } = await this.groups.createInvite(
      id,
      req.user.id,
      dto,
    );
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const link = `${appUrl}/groups/invitations/accept?token=${encodeURIComponent(token)}`;
    await this.mail.sendMail(
      dto.email,
      'Group invitation',
      `<p>You have been invited to join group <b>${id}</b>.</p><p>Follow the link: <a href="${link}">${link}</a></p>`,
    );
    // For development convenience, return link in response
    return { invite, link };
  }

  @Post('invitations/accept')
  async accept(@Req() req: any, @Body() dto: AcceptGroupInviteDto) {
    return this.groups.acceptInvite(req.user.id, req.user.email, dto);
  }

  @Get('mine')
  async myGroups(@Req() req: any) {
    const userId = req.user.id;
    const admin = await this.groups['prisma'].group.findMany({
      where: { adminId: userId },
    });
    const memberLinks = await this.groups['prisma'].userGroup.findMany({
      where: { userId },
      include: { group: true },
    });
    const member = memberLinks.map((l) => l.group);
    return { admin, member };
  }
}
