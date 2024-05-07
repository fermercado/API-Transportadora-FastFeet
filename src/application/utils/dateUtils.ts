import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export class DateUtils {
  static formatToBrazilianDateTime(date: Date | undefined): string {
    if (!date) return '';
    return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
  }
}
