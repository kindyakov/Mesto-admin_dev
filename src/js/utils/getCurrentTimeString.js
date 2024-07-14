export function getCurrentTimeString(sep = '-') {
  // Получение текущей даты и времени
  const now = new Date();

  // Извлечение часов, минут и секунд
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  // Форматирование часов, минут и секунд с добавлением ведущего нуля, если необходимо
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  // Возвращение строки в формате "часы-минуты-секунды"
  return `${hours}${sep}${minutes}${sep}${seconds}`;
}