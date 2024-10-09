import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { AppointmentEntity } from './appointment.entity';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
dayjs.extend(customParseFormat);

type Slot = {
  date: string;
  startTime: string;
  endTime: string;
};

@Injectable()
export class AppointmentRepo {
  private appointments: AppointmentEntity[];
  constructor() {
    this.appointments = [
      {
        bookerId: 'Adam',
        date: '27/03/2024',
        startTime: '9:00AM',
        endTime: '9:30AM',
      },
      {
        bookerId: 'John Smith',
        date: '27/03/2024',
        startTime: '10:00AM',
        endTime: '10:30AM',
      },
    ];
  }

  findAll() {
    return this.appointments;
  }

  save(newAppointment: AppointmentEntity) {
    // TODO:  Save only if start time and date is different
    this.appointments.push(newAppointment);
    console.log('appointments', this.appointments);
  }
}

@Injectable()
export class AppointmentService {
  constructor(private appointmentRepo: AppointmentRepo) {}

  private generateAvailableSlots = (date: string) => {
    const availableSlots: Slot[] = [];
    // TODO:  Use config module for env
    let slotStartTime = dayjs(process.env.SLOT_START_TIME, 'h:mmA');
    const slotEndTime = dayjs(process.env.SLOT_END_TIME, 'h:mmA');
    const slotDuration = parseInt(
      process.env.SLOT_DURATION_MINUTES ?? '30',
      10,
    );
    while (slotStartTime.isBefore(slotEndTime)) {
      const currentSlotEnd = slotStartTime.add(slotDuration, 'minute');

      // Add the slot to the list if it ends before or exactly at the slotEndTime time
      if (
        currentSlotEnd.isBefore(slotEndTime) ||
        currentSlotEnd.isSame(slotEndTime)
      ) {
        availableSlots.push({
          date,
          startTime: slotStartTime.format('h:mmA'),
          endTime: currentSlotEnd.format('h:mmA'),
        });
      }

      // Move to the next slot
      slotStartTime = currentSlotEnd;
    }
    return availableSlots;
  };

  public getAvailableSlots(date: string) {
    // Query from db
    const existingAppointments: AppointmentEntity[] =
      this.appointmentRepo.findAll();

    const availableSlots = this.generateAvailableSlots(date).filter((slot) => {
      const foo = !existingAppointments.some(
        (app) => slot.startTime === app.startTime,
      );
      return foo;
    });
    console.log({ availableSlots });
    return availableSlots;
  }

  public createAppointment(createAppointmentInput: CreateAppointmentDto) {
    this.appointmentRepo.save(createAppointmentInput);
    console.log({ createAppointmentInput });
    return true;
  }
}
