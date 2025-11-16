import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  AnalyticsService,
  TeamAnalyticsResponse,
} from './analytics.service';
import { Request } from 'express';

type AuthenticatedRequest = Request & { user: { id: number } };

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('team/:listId')
  teamAnalytics(
    @Req() req: AuthenticatedRequest,
    @Param('listId', ParseIntPipe) listId: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<TeamAnalyticsResponse> {
    return this.analytics.teamAnalytics(req.user.id, listId, { from, to });
  }
}
