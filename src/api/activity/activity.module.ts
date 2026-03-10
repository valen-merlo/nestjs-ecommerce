import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from 'src/database/entities/activity-log.entity';
import { ActivityController } from './activity.controller';
import { ActivityRecorderService } from './activity-recorder.service';
import { ActivityService } from './activity.service';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog])],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityRecorderService],
})
export class ActivityModule {}
