// Функция для получения диапазона предыдущих месяцев
export const getPreviousMonthsRanges = (startDate, endDate, monthsCount = 9) => {
  const ranges = [];
  const start = new Date(startDate);

  for (let i = 1; i <= monthsCount; i++) {
    // Вычисляем дату для предыдущего месяца
    const prevMonthEnd = new Date(start);
    prevMonthEnd.setMonth(start.getMonth() - i);
    prevMonthEnd.setDate(1); // Устанавливаем первый день месяца

    // Последний день предыдущего месяца
    const lastDay = new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth() + 1, 0);

    ranges.push({
      start_date: prevMonthEnd.toISOString().split('T')[0],
      end_date: lastDay.toISOString().split('T')[0]
    });
  }

  return ranges;
};