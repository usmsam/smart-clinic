import { BadRequestException } from '@nestjs/common';
import { DateValidationPipe } from './date-validation.pipe';

describe('DateValidationPipe', () => {
  it('passes valid date strings', () => {
    const pipe = new DateValidationPipe();
    expect(pipe.transform('2026-06-11')).toBe('2026-06-11');
  });

  it('throws for invalid dates', () => {
    const pipe = new DateValidationPipe();
    expect(() => pipe.transform('invalid')).toThrow(BadRequestException);
  });
});
