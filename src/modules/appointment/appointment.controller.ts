import { Controller, Get, Post, Query } from '@nestjs/common';
import { AppointmentService } from './appointment.service';

@Controller('appointment')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  @Get()
  findAll(@Query('date') date: string) {
    console.log({ date });
    return this.appointmentService.getAvailableSlots(date);
  }

  @Post()
  bookAppointment() {
    // validate if the slot is available

    // available slot should be deducted upon successful appointment
    return 'appointment booked';
  }
}
