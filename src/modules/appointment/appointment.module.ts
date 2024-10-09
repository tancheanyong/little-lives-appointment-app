import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentRepo, AppointmentService } from './appointment.service';

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService, AppointmentRepo],
})
export class AppointmentModule {}
