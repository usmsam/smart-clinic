import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsMongoId()
  scheduleId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
