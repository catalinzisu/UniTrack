import { Pipe, PipeTransform } from '@angular/core';
import { differenceInDays } from 'date-fns';

@Pipe({
  name: 'daysUntil',
  standalone: true
})
export class DaysUntilPipe implements PipeTransform {
  transform(value: string | Date | undefined): string {
    if (!value) return 'Nesetată';
    
    const targetDate = new Date(value);
    targetDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (targetDate < today) {
      return 'Examen susținut';
    }
    
    const days = differenceInDays(targetDate, today);
    if (days === 0) return 'Astăzi';
    if (days === 1) return 'Mâine';
    return `În ${days} zile`;
  }
}
