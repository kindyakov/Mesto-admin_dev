export function getFormattedDate(date = new Date(), format = 'DD.MM.YYYY') {
  if (!date) {
    return ''
  }

  if (typeof date === 'string') {
    date = new Date(Date.parse(date));
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const shortYear = year.toString().slice(-2);

  let formattedDate = format
    .replace("DD", day)
    .replace("MM", month)
    .replace("YYYY", year)
    .replace("YY", shortYear);

  return formattedDate;
}

export function getMonthName(dateString) {
  const months = ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сент', 'Окт', 'Нояб', 'Дек'];
  const [year, month] = dateString.split('-');
  return months[month - 1];
}