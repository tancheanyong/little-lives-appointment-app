import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { AppointmentEntity } from './appointment.entity';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
dayjs.extend(customParseFormat);

type Slot = Omit<AppointmentEntity, 'bookerId'> & { available_slots: number };

@Injectable()
export class AppointmentRepo {
  private appointments: AppointmentEntity[];
  constructor() {
    this.appointments = [
      {
        bookerId: 'Adam',
        date: '27/03/2024',
        time: '9:00AM',
      },
      {
        bookerId: 'John Smith',
        date: '27/03/2024',
        time: '10:00AM',
      },
    ];
  }

  findAll() {
    return this.appointments;
  }

  save(newAppointment: AppointmentEntity) {
    this.appointments.push(newAppointment);
  }
}

@Injectable()
export class AppointmentService {
  constructor(private appointmentRepo: AppointmentRepo) {}

  private generateDailySlots = (date: string) => {
    // Can't book on weekends
    if (
      dayjs(date, 'dd/mm/yyyy').day() === 0 ||
      dayjs(date, 'dd/mm/yyyy').day() === 6
    ) {
      return [];
    }
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

      if (
        currentSlotEnd.isBefore(slotEndTime) ||
        currentSlotEnd.isSame(slotEndTime)
      ) {
        availableSlots.push({
          date,
          time: slotStartTime.format('h:mmA'),
          available_slots: parseInt(
            process.env.AVAILABLE_SLOTS_AMOUNT ?? '1',
            10,
          ),
        });
      }

      // Move to the next slot
      slotStartTime = currentSlotEnd;
    }
    return availableSlots;
  };

  public getAvailableSlots(date: string) {
    const parsedDate = dayjs(date, 'DD/MM/YYYY', true);
    if (!parsedDate.isValid()) {
      throw new BadRequestException(
        `date must be in the format of "DD/MM/YYYY"`,
      );
    }
    // get existing appointments for the given date
    const existingAppointments: AppointmentEntity[] = this.appointmentRepo
      .findAll()
      .filter((app) => app.date === date);

    // get daily available slots
    const dailySlots = this.generateDailySlots(date);

    // Go through daily available slots, and for each time bracket, query how many of the
    // same time bracket exists in existing appointments, then minus from the avaiable_slots
    const availableSlots = dailySlots.map((slot) => {
      const bookedSlotsAmount = existingAppointments.filter(
        (app) => app.time === slot.time,
      ).length;
      return {
        ...slot,
        available_slots: slot.available_slots - bookedSlotsAmount,
      };
    });

    return availableSlots;
  }

  public createAppointment(createAppointmentInput: CreateAppointmentDto) {
    const availableSlots = this.getAvailableSlots(
      createAppointmentInput.date,
    ).find((slot) => slot.time === createAppointmentInput.time);

    if (
      !availableSlots?.available_slots ||
      availableSlots?.available_slots <= 0
    ) {
      throw new ForbiddenException(`Slot unavailable`);
    }

    this.appointmentRepo.save(createAppointmentInput);
    return true;
  }
}
