import { Module } from '@nestjs/common';
import { TimezonesController } from './timezones.controller';
import { TimezonesService } from './timezones.service';

@Module({
  controllers: [TimezonesController],
  providers: [TimezonesService],
})
export class TimezonesModule {}
