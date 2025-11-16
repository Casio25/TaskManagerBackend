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
import { CalendarService } from './calendar.service';

function parseRange(query: any) {
  const range: { from?: Date; to?: Date } = {};
  if (query.from) {
    const from = new Date(query.from);
    if (!isNaN(from.getTime())) range.from = from;
  }
  if (query.to) {
    const to = new Date(query.to);
    if (!isNaN(to.getTime())) range.to = to;
  }
  return range;
}

@UseGuards(JwtAuthGuard)
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendar: CalendarService) {}

  @Get('me')
  myCalendar(@Req() req: any, @Query() query: any) {
    return this.calendar.userCalendar(req.user.id, parseRange(query));
  }

  @Get('project/:id')
  projectCalendar(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: any,
  ) {
    return this.calendar.projectCalendar(req.user.id, id, parseRange(query));
  }
}
