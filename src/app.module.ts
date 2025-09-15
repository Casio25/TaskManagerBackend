import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GroupsModule } from './groups/groups.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [PrismaModule, AuthModule, GroupsModule, ProjectsModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
