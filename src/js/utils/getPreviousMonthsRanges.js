// Функция для получения диапазона предыдущих месяцев
export const getPreviousMonthsRanges = (startDate, endDate, monthsCount = 9) => {
  const ranges = [];
  const start = new Date(startDate);

  const fmt = d =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  for (let i = 1; i <= monthsCount; i++) {
    const firstOfPrev = new Date(start);
    firstOfPrev.setMonth(start.getMonth() - i);
    firstOfPrev.setDate(1);

    // последний день предыдущего месяца (локально)
    const lastDay = new Date(firstOfPrev.getFullYear(), firstOfPrev.getMonth() + 1, 0);

    ranges.push({
      start_date: fmt(firstOfPrev),
      end_date: fmt(lastDay)
    });
  }

  return ranges;
};
