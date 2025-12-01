// Временный файл для исправления проблемы с bonus_percent
const fixBonusPercent = (input) => {
  // Удаляем старую маску если есть
  if (input.inputmask) {
    input.inputmask.remove();
  }

  // Добавляем обработчики
  input.addEventListener('input', (e) => {
    let value = e.target.value;

    // Удаляем все символы кроме цифр и одной запятой
    value = value.replace(/[^0-9,]/g, '');

    // Оставляем только одну запятую
    const parts = value.split(',');
    if (parts.length > 2) {
      value = parts[0] + ',' + parts.slice(1).join('');
    }

    // Ограничиваем одним знаком после запятой
    if (parts[1] && parts[1].length > 1) {
      value = parts[0] + ',' + parts[1].substring(0, 1);
    }

    e.target.value = value;
  });

  // Заменяем точку на запятую при потере фокуса
  input.addEventListener('blur', (e) => {
    let value = e.target.value.replace('.', ',');
    e.target.value = value;
  });
};

export default fixBonusPercent;