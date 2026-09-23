// utils/dateFormatter.ts
// Utilitários para formatação de datas no fuso horário de Brasília

// Configuração do timezone
const TIMEZONE = 'America/Sao_Paulo';
const LOCALE = 'pt-BR';

class DateFormatter {
  // Converte Date para formato brasileiro legível (dd/mm/yyyy hh:mm:ss)
  static toReadable(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return '-';
    }

    const options: Intl.DateTimeFormatOptions = {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };

    const parts = new Intl.DateTimeFormat(LOCALE, options).formatToParts(date);

    // Extrai componentes formatados
    const getValue = (type: string): string => 
      parts.find((p) => p.type === type)?.value || '00';

    const day = getValue('day');
    const month = getValue('month');
    const year = getValue('year');
    const hour = getValue('hour');
    const minute = getValue('minute');
    const second = getValue('second');

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  }

  // Formato curto sem segundos (dd/mm/yyyy hh:mm)
  static toShort(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return '-';
    }

    const options: Intl.DateTimeFormatOptions = {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };

    return new Intl.DateTimeFormat(LOCALE, options).format(date);
  }

  // Apenas data (dd/mm/yyyy)
  static toDateOnly(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return '-';
    }

    const options: Intl.DateTimeFormatOptions = {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    return new Intl.DateTimeFormat(LOCALE, options).format(date);
  }

  // Apenas hora (hh:mm:ss)
  static toTimeOnly(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return '-';
    }

    const options: Intl.DateTimeFormatOptions = {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };

    return new Intl.DateTimeFormat(LOCALE, options).format(date);
  }

  // Converte timestamp Unix (segundos) para Date
  static fromTimestamp(timestamp: number): Date {
    // Verifica se é em segundos ou milissegundos
    const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    return new Date(ms);
  }

  // Formata para input HTML date (yyyy-mm-dd)
  static toInputDate(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Formata para input HTML datetime-local
  static toInputDateTime(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Retorna tempo relativo (há X minutos, há X horas)
  static toRelative(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return '-';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Agora mesmo';
    if (diffMin < 60) return `Há ${diffMin} minuto(s)`;
    if (diffHour < 24) return `Há ${diffHour} hora(s)`;
    if (diffDay < 7) return `Há ${diffDay} dia(s)`;
    
    return this.toDateOnly(date);
  }
}

export default DateFormatter;
