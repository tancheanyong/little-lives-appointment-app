import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';

@Controller('appointment')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  @Get()
  findAvailableSlots(@Query('date') date: string) {
    console.log({ date });
    return this.appointmentService.getAvailableSlots(date);
  }

  @Post()
  bookAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.createAppointment(createAppointmentDto);
  }
}
