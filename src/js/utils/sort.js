export function sort(arr, order = "asc") {
  return arr.sort((a, b) => {
    let comparison = 0;

    // Проверяем, являются ли элементы числами
    if (!isNaN(a) && !isNaN(b)) {
      comparison = a - b; // Числовое сравнение
    }
    // Проверяем, являются ли элементы датами
    else if (!isNaN(new Date(a)) && !isNaN(new Date(b))) {
      comparison = new Date(a) - new Date(b); // Сравнение дат
    }
    // В остальных случаях (обычные строки) сравниваем лексикографически
    else {
      comparison = a.localeCompare(b);
    }

    // Возвращаем результат в зависимости от порядка сортировки
    return order === "desc" ? -comparison : comparison;
  });
}
