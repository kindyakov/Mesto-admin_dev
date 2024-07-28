import { format as formatDate } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Функция для форматирования даты с локалью ru по умолчанию.
 * 
 * @param {Date | number} date - Дата, которую нужно отформатировать.
 * @param {string} format - Формат вывода даты.
 * @returns {string} - Отформатированная строка даты.
 */

export function dateFormatter(date, format = "DD.MM.YYYY") {
  // Проверка на случай, если дата не передана или не является объектом Date
  if (!date) {
    throw new Error("Date is required");
  }

  return formatDate(date, format, { locale: ru });
}