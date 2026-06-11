import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DateValidationPipe } from './pipes/date-validation.pipe';
import { ParseObjectIdPipe } from './pipes/parse-object-id.pipe';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [ConfigModule],
  providers: [JwtAuthGuard, RolesGuard, ParseObjectIdPipe, DateValidationPipe],
  exports: [JwtAuthGuard, RolesGuard, ParseObjectIdPipe, DateValidationPipe],
})
export class CommonModule {}
