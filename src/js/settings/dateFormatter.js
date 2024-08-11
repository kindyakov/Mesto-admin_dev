import { format as formatDate, parse } from 'date-fns';
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
    return '';
  }

  // Если дата представлена строкой, пытаемся её преобразовать в объект Date
  if (typeof date === 'string' || typeof date === 'number') {
    if (date.includes('.')) {
      date = parse(date, 'dd.MM.yyyy', new Date());
    } else {
      date = new Date(date);
    }
  }

  // Проверка, если преобразование даты прошло неудачно
  if (!(date instanceof Date) || isNaN(date)) {
    console.error("Invalid date");
    return ''; // Возвращаем пустую строку, если дата некорректна
  }

  return formatDate(date, format, { locale: ru });
}