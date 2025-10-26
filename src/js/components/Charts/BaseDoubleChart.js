import { Loader } from '../../modules/myLoader.js';
import { createCalendar } from '../../settings/createCalendar.js';
import { getFinancePlan } from '../../settings/request.js';
/**
 * Базовый класс для графиков с двумя canvas (верхний и нижний)
 * Включает встроенную систему tooltip как в BaseChart
 */
class BaseDoubleChart {
  constructor(ctx, options = {}) {
    // Если ctx это canvas, заменяем его на контейнер
    if (ctx.tagName === 'CANVAS') {
      const parent = ctx.parentElement;
      ctx.remove();
      ctx = parent;
    }

    this.container = ctx;
    this.wpChart = this.container.closest('.wp-chart') || this.container;
    this.app = window.app;
    this.options = options;

    this.section = this.wpChart.closest('.business-section')
    this.form = this.section.querySelector('.form-filter')
    this.checkbox = this.section.querySelector('[type="checkbox"]')
    this.loaderForm = new Loader(this.form)

    this.calendars = createCalendar(this.form.querySelector('.input-date'), {
      mode: 'range',
      dateFormat: 'd. M, Y',
      defaultDate: this.app.defaultDate,
      onChange: (selectedDates, dateStr, instance) => {
        const [nameOne, nameTwo] = instance.element.name.split(',')

        if (selectedDates.length === 2) {
          const params = {
            [nameOne]: dateFormatter(selectedDates[0], 'yyyy-MM-dd'),
            [nameTwo]: dateFormatter(selectedDates[1], 'yyyy-MM-dd')
          }
        }
      }
    });


    // Создаем DOM структуру
    this.createCanvasStructure();

    // Подписка на resize
    window.addEventListener('resize', () => this.resizeChart());
    this.form.addEventListener('submit', (e) => e.preventDefault())
  }



  /**
   * Создает DOM структуру: два canvas с контейнерами и tooltip
   */
  createCanvasStructure() {
    // Контейнер верхнего графика
    const topContainer = document.createElement('div');
    topContainer.style.cssText = 'position: relative; margin-bottom: 10px;';

    // Контейнер нижнего графика
    const bottomContainer = document.createElement('div');
    bottomContainer.style.cssText = 'position: relative;';

    // Canvas для верхнего графика
    this.topCanvas = document.createElement('canvas');
    this.topCanvas.id = this.options.topCanvasId || 'chart-top';
    this.topCanvas.style.cssText = this.options.topCanvasStyle || 'max-height: 200px;';

    // Canvas для нижнего графика
    this.bottomCanvas = document.createElement('canvas');
    this.bottomCanvas.id = this.options.bottomCanvasId || 'chart-bottom';
    this.bottomCanvas.style.cssText = this.options.bottomCanvasStyle || 'max-height: 150px;';

    // Tooltip для верхнего графика
    this.topTooltip = document.createElement('div');
    this.topTooltip.style.cssText = 'opacity: 0; position: absolute; pointer-events: none;';
    this.topTooltip.className = 'chart-tooltip-double';
    this.topTooltip.innerHTML = this.createTooltipHTML()

    // Tooltip для нижнего графика
    this.bottomTooltip = document.createElement('div');
    this.bottomTooltip.style.cssText = 'opacity: 0; position: absolute; pointer-events: none;';
    this.bottomTooltip.className = 'chart-tooltip-double';
    this.bottomTooltip.innerHTML = this.createTooltipHTML()

    // Собираем DOM структуру
    topContainer.appendChild(this.topCanvas);
    topContainer.appendChild(this.topTooltip);
    bottomContainer.appendChild(this.bottomCanvas);
    bottomContainer.appendChild(this.bottomTooltip);

    this.container.appendChild(topContainer);
    this.container.appendChild(bottomContainer);
  }

  /**
   * Создает настройки tooltip для графика с новым дизайном
   * @param {Function} onExternalCallback - Дополнительная обработка данных tooltip
   * @param {Object} options - Опции tooltip { showExtra: boolean, dateLabel: string }
   */
  getTooltipConfig(onExternalCallback, options = {}) {
    const { showExtra = false } = options;

    return {
      enabled: false,
      position: 'average',
      mode: 'index',
      intersect: false,
      external: context => {
        const { chart, tooltip } = context;
        const tooltipEl = chart.canvas.parentNode.querySelector('.chart-tooltip-double');

        if (!tooltipEl) return;
        if (tooltip.opacity === 0) {
          tooltipEl.style.opacity = 0;
          return;
        }

        const dataI = tooltip.dataPoints[0].dataIndex;
        tooltipEl.style.opacity = 1;
        this.onPosExternal(tooltipEl, chart, tooltip, dataI);
        if (onExternalCallback) {
          onExternalCallback(tooltipEl, chart, tooltip, dataI);
        }
      }
    };
  }

  /**
   * Настройки hover (как в BaseChart для mode: 'index')
   */
  getHoverConfig() {
    return {
      mode: 'index',
      intersect: false
    };
  }

  /**
   * Создает плагин вертикальной линии для line графиков
   */
  createVerticalLinePlugin() {
    return {
      id: 'verticalLine',
      afterDraw: (chart) => {
        if (chart.tooltip._active && chart.tooltip._active.length) {
          const ctx = chart.ctx;
          ctx.save();

          const activePoint = chart.tooltip._active[0];
          const x = activePoint.element.x;
          const topY = chart.scales.y.top;
          const bottomY = chart.scales.y.bottom;

          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(x, topY);
          ctx.lineTo(x, bottomY);
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.stroke();

          ctx.restore();
        }
      }
    };
  }


  createTooltipHTML() {
    return `
    <div>
      <p class="date"></p>
      <p>План: <b class="plan" style="color: #746afa;"></b></p>
      <p>Факт: <b class="fact" style="color: #37b456;"></b></p>
    </div>
    <div class="sklad hidden">
    </div>
    `
  }

  /**
   * Позиционирование tooltip с проверкой границ по X и Y
   */
  onPosExternal(tooltipEl, chart, tooltip, dataI) {
    // Проверка по X (слева/справа)
    const leftPosition = (chart.canvas.offsetLeft + tooltip.caretX) - tooltipEl.clientWidth - 6;

    if (leftPosition < 0) {
      // Показываем справа
      tooltipEl.style.left = (chart.canvas.offsetLeft + tooltip.caretX) + 6 + 'px';
    } else {
      // Показываем слева
      tooltipEl.style.left = leftPosition + 'px';
    }

    // Проверка по Y (сверху/снизу)
    const topPosition = (chart.canvas.offsetTop + tooltip.caretY) - tooltipEl.clientHeight - 6;

    if (topPosition < 0) {
      // Показываем снизу
      tooltipEl.style.top = (chart.canvas.offsetTop + tooltip.caretY) + 6 + 'px';
    } else {
      // Показываем сверху
      tooltipEl.style.top = topPosition + 'px';
    }
  }

  /**
   * Дополнительная обработка tooltip для верхнего графика
   * Переопределите в дочернем классе при необходимости
   */
  onTopExternal(tooltipEl, chart, tooltip, dataI) {
    // Переопределить в дочернем классе
  }

  /**
   * Дополнительная обработка tooltip для нижнего графика
   * Переопределите в дочернем классе при необходимости
   */
  onBottomExternal(tooltipEl, chart, tooltip, dataI) {
    // Переопределить в дочернем классе
  }

  /**
   * Инициализация верхнего графика
   * ОБЯЗАТЕЛЬНО переопределить в дочернем классе
   */
  initTopChart() {
    throw new Error('initTopChart() must be implemented in child class');
  }

  /**
   * Инициализация нижнего графика
   * ОБЯЗАТЕЛЬНО переопределить в дочернем классе
   */
  initBottomChart() {
    throw new Error('initBottomChart() must be implemented in child class');
  }

  /**
   * Обработка resize окна
   */
  resizeChart() {
    if (this.topChart) {
      this.topChart.update('resize');
    }
    if (this.bottomChart) {
      this.bottomChart.update('resize');
    }
  }

  /**
   * Рендеринг данных
   * Переопределить в дочернем классе
   */
  render(data) {
    throw new Error('render() must be implemented in child class');
  }

  /**
   * Создает линейный градиент
   */
  createLinearGradient(canvas, colorOne, colorTwo, height = 400) {
    const gradient = canvas.getContext("2d").createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, colorOne);
    gradient.addColorStop(1, colorTwo);
    return gradient;
  }
}

export default BaseDoubleChart;
