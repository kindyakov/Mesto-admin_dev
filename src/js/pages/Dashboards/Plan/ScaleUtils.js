class ScaleUtils {
  /**
   * Определяет оптимальный шаг для шкалы на основе максимального значения
   * @param {number} maxValue - Максимальное значение (план)
   * @returns {Array} - Массив значений для шкалы
   */
  static calculateScaleSteps(maxValue) {
    const containerWidth = window.innerWidth;

    // Определяем максимальное количество делений в зависимости от ширины экрана
    let maxDivisions;
    if (containerWidth < 480) { // мобильные устройства
      maxDivisions = 5;
    } else if (containerWidth < 768) { // планшеты
      maxDivisions = 8;
    } else { // десктоп
      maxDivisions = 15;
    }

    // Возможные шаги в процентах
    const possibleSteps = [10, 20, 25, 50, 100];
    let selectedStep = 10;

    // Выбираем подходящий шаг
    for (let step of possibleSteps) {
      const divisionsCount = 100 / step + 1; // +1 для включения 0
      if (divisionsCount <= maxDivisions) {
        selectedStep = step;
        break;
      }
    }

    // Генерируем массив значений
    const steps = [];
    for (let i = 0; i <= 100; i += selectedStep) {
      steps.push((maxValue * i) / 100);
    }

    return steps;
  }

  /**
   * Форматирует значения для отображения на шкале
   * @param {number} value - Значение для форматирования
   * @returns {string} - Отформатированное значение
   */
  static formatScaleValue(value) {
    if (value === 0) return '0';

    if (value >= 1000000) {
      return (value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + 'K';
    } else {
      return Math.round(value).toString();
    }
  }

  /**
   * Обновляет шкалу для конкретного типа полоски
   * @param {HTMLElement} wrapper - Контейнер компонента
   * @param {string} scaleType - Тип шкалы из data-scale атрибута
   * @param {number} maxValue - Максимальное значение (план)
   */
  static updateScale(wrapper, scaleType, maxValue) {
    // Находим контейнер шкалы по data-scale атрибуту
    const scaleContainer = wrapper.querySelector(`[data-scale="${scaleType}"]`);

    if (!scaleContainer) return;

    // Определяем оптимальный шаг для шкалы
    const steps = this.calculateScaleSteps(maxValue);

    // Очищаем текущую шкалу
    scaleContainer.innerHTML = '';

    // Создаем новые элементы шкалы
    steps.forEach(value => {
      const span = document.createElement('span');
      span.textContent = this.formatScaleValue(value);
      scaleContainer.appendChild(span);
    });
  }

  /**
   * Обновляет все шкалы для всех типов полосок
   * @param {HTMLElement} wrapper - Контейнер компонента
   * @param {Object} result - Объект с данными
   * @param {Object} scaleMappings - Маппинг типов шкал
   */
  static updateAllScales(wrapper, result, scaleMappings) {
    Object.keys(scaleMappings).forEach(scaleType => {
      const mapping = scaleMappings[scaleType];
      const plannedValue = result[mapping.planned] || 0;

      if (plannedValue > 0) {
        this.updateScale(wrapper, scaleType, plannedValue);
      }
    });
  }
}

export default ScaleUtils;