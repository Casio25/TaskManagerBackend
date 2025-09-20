import { Module } from '@nestjs/common';
import { ColleaguesService } from './colleagues.service';
import { ColleaguesController } from './colleagues.controller';

@Module({
  controllers: [ColleaguesController],
  providers: [ColleaguesService],
})
export class ColleaguesModule {}
