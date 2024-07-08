export function addPrefixToNumbers(input) {
  // Разделяем строку по запятой и удаляем лишние пробелы
  let numbers = input.split(',').map(num => num.trim());
  // Добавляем префикс "№" к каждому числу
  let prefixedNumbers = numbers.map(num => `№${num}`);
  // Объединяем обратно в строку через запятую
  return prefixedNumbers.join(', ');
}