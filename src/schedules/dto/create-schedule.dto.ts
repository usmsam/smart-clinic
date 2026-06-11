import { IsBooleanString, IsMongoId, IsOptional, IsString, Matches } from 'class-validator';

export class CreateScheduleDto {
  @IsOptional()
  @IsMongoId()
  doctorId?: string;

  @IsString()
  workDay!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endTime!: string;

  @IsBooleanString()
  isActive!: string;
}
