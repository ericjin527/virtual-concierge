import { Module } from '@nestjs/common';
import { ExpertTasksController } from './expert-tasks.controller';
import { ExpertTasksService } from './expert-tasks.service';

@Module({
  controllers: [ExpertTasksController],
  providers: [ExpertTasksService],
})
export class ExpertTasksModule {}
