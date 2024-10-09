import { IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  bookerId: string;

  // TODO:  Proper date and string validation
  @IsString()
  date: string;

  @IsString()
  time: string;
}
