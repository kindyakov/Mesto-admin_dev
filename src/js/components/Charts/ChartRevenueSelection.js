import BaseChart from "./BaseChart.js";
import merge from 'lodash.merge';
import { formattingPrice } from '../../utils/formattingPrice.js';
import ColorManager from '../../utils/ColorManager.js';

class ChartRevenueSelection extends BaseChart {
  constructor(ctx, addOptions = {}) {
    // Создаем и добавляем элемент тултипа ДО создания графика
    const wpChart = ctx.closest('.wp-chart');
    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'chart-tooltip';
    tooltipEl.style.opacity = '0';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.pointerEvents = 'none';

    const defaultOptions = {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [1],
          backgroundColor: [
            '#5782A1',
            '#E3AA39',
            '#19D06D',
            '#E03D3D',
            '#EFBB34',
            '#9B59B6',
            '#3498DB',
            '#E67E22',
            '#1ABC9C',
            '#34495E',
          ],
          color: [
            '#5782A1',
            '#E3AA39',
            '#19D06D',
            '#E03D3D',
            '#EFBB34',
            '#9B59B6',
            '#3498DB',
            '#E67E22',
            '#1ABC9C',
            '#34495E',
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
          cutout: '30%',
          hoverOffset: 4
        }]
      },
      options: {
        scales: {
          y: {
            display: false
          },
          x: {
            display: false
          }
        },
        plugins: {
          tooltip: {
            enabled: false,
            external: (context) => {
              const { chart, tooltip } = context;

              if (!tooltipEl) return;

              if (tooltip.opacity === 0) {
                tooltipEl.style.opacity = 0;
                return;
              }

              const dataI = tooltip.dataPoints[0].dataIndex;
              tooltipEl.style.opacity = 1;
              this.onPosExternal(tooltipEl, chart, tooltip, dataI);
              this.onExternal(tooltipEl, chart, tooltip, dataI);
            }
          },
          legend: {
            display: false
          }
        },
        layout: {
          padding: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10
          }
        }
      }
    }

    super(ctx, merge({}, defaultOptions, addOptions))

    this.wpChart = this.chart.canvas.closest('.wp-chart')
    this.tooltipEl = tooltipEl

    // Устанавливаем HTML содержимое и добавляем в DOM
    this.tooltipEl.innerHTML = this.createTooltipHTML();
    this.wpChart.appendChild(this.tooltipEl);

    this.onExternal = this.onExternal.bind(this)
  }

  onPosExternal(tooltipEl, chart, tooltip, dataI) {
    // Позиционируем tooltip справа внизу графика
    tooltipEl.style.left = (chart.canvas.offsetLeft + chart.canvas.clientWidth) - tooltipEl.clientWidth + 'px';
    tooltipEl.style.top = (chart.canvas.offsetTop + chart.canvas.clientHeight) + 6 + 'px';
  }

  // Create tooltip HTML
  createTooltipHTML() {
    return `
      <div class="sklad flex flex-col gap-0.5 items-start text-left text-xs">
      </div>
    `;
  }

  // Update tooltip content for warehouse data
  onExternal(tooltipEl, chart, tooltip, dataI) {
    const skladBlock = tooltipEl.querySelector('.sklad');
    skladBlock.innerHTML = '';

    if (this.chart.data.datasets[0].data && this.chart.data.datasets[0].data.length > 0 && dataI >= 0) {
      const data = this.chart.data.datasets[0].data;
      const labels = this.chart.data.labels;
      const colors = this.chart.data.datasets[0].backgroundColor;

      // Общая сумма всех сегментов
      const totalSum = data.reduce((acc, val) => acc + val, 0);

      // Добавляем общую сумму
      skladBlock.insertAdjacentHTML('beforeend',
        `<p class="w-full" style="margin-bottom: 10px;">Сумма: ${formattingPrice(totalSum)}</p>`
      );

      // Добавляем данные по каждому сегменту (складу)
      data.forEach((value, index) => {
        const percentage = totalSum > 0 ? ((value / totalSum) * 100).toFixed(1) : 0;
        // Подсвечиваем активный сегмент ярче
        const isActiveSegment = index === dataI;
        const fontWeight = isActiveSegment ? 'font-weight: bold;' : '';

        // Используем реальное название склада из labels или запасной вариант
        const warehouseName = labels[index] || `Склад ${index + 1}`;

        skladBlock.insertAdjacentHTML('beforeend',
          `<p class="w-full" style="color: ${colors[index]}; ${fontWeight}">
           ${warehouseName}: ${formattingPrice(value)} (${percentage}%)
          </p>`
        );
      });
    }
  }

  // Original render method for backward compatibility
  render([{ revenue, reestr_sum, rest_in_reestr }, { finance_planfact }]) {
    // // Show data without text labels - only visual segments
    // if (revenue) {
    //   this.chart.data.labels = []; // Empty labels - no text
    //   this.chart.data.datasets[0].data = [revenue];
    //   this.chart.data.datasets[0].backgroundColor = [ColorManager.getWarehouseColor(window.app.warehouse?.warehouse_id || 1)];
    //   this.chart.data.datasets[0].color = [ColorManager.getWarehouseColor(window.app.warehouse?.warehouse_id || 1)];
    // } else {
    //   this.clearData();
    // }
    // this.chart.update();
  }

  // New method to render warehouse-specific data from bar selections
  renderForSelection(labels, data, colors) {
    if (!labels || labels.length === 0 || !data || data.length === 0) {
      this.clearData();
      return;
    }

    // Update chart data with visual segments only - no text labels
    this.chart.data.labels = labels; // Store labels for tooltip use
    this.chart.data.datasets[0].data = data;
    this.chart.data.datasets[0].backgroundColor = colors;
    this.chart.data.datasets[0].color = colors;

    this.chart.update();
  }

  // Clear chart data (show gray empty state)
  clearData() {
    this.chart.data.labels = [];
    this.chart.data.datasets[0].data = [];
    this.chart.data.datasets[0].backgroundColor = [ColorManager.COLORS.EMPTY_CHART];
    this.chart.data.datasets[0].color = [ColorManager.COLORS.EMPTY_CHART];
    this.chart.update();
  }
}

export default ChartRevenueSelection;
