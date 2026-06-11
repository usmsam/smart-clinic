import { IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateDoctorDto {
  @IsMongoId()
  userId!: string;

  @IsMongoId()
  departmentId!: string;

  @IsString()
  @MinLength(2)
  specialization!: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  roomNumber?: string;
}
