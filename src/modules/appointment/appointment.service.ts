import { AppointmentEntity } from './appointment.entity';

type Slot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
};

export class AppointmentService {
  private generateAvailableSlots = (date: string) => {
    const availableSlots: Slot[] = [
      {
        id: '1',
        date,
        startTime: '9:00AM',
        endTime: '9:30AM',
      },
      {
        id: '2',
        date,
        startTime: '11:00AM',
        endTime: '11:30AM',
      },
    ];
    // for (const slotNumber of NumberOfSlotsInADay) {
    //   availableSlots.push({ id: slotNumber,date,startTime:});
    // }
    return availableSlots;
  };

  public getAvailableSlots(date: string) {
    // Query from db
    const existingAppointments: AppointmentEntity[] = [
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

    const availableSlots = this.generateAvailableSlots(date).filter((slot) => {
      const foo = !existingAppointments.some(
        (app) => slot.startTime === app.startTime,
      );
      console.log({ foo });
      return foo;
    });
    console.log({ availableSlots });
    return availableSlots;
  }
}
