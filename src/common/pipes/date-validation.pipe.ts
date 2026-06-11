import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class DateValidationPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date');
    }
    return value;
  }
}

