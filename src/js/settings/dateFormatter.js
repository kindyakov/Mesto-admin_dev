import { format as formatDate, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Функция для форматирования даты с локалью ru по умолчанию.
 * 
 * @param {Date | string | number} date - Дата, которую нужно отформатировать. Может быть объектом Date, строкой или числом.
 * @param {string} format - Формат вывода даты.
 * @returns {string} - Отформатированная строка даты.
 */
export function dateFormatter(date, format = "dd.MM.yyyy") {
  if (!date) {
    throw new Error("Date is required");
  }

  // Если дата представлена строкой, пытаемся её распарсить
  if (typeof date === 'string') {
    date = parseISO(date);
  }

  // Проверка, если преобразование даты прошло неудачно
  if (!(date instanceof Date) || isNaN(date)) {
    throw new Error("Invalid date");
  }

  return formatDate(date, format, { locale: ru });
}