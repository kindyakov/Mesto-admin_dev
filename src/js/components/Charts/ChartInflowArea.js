import BaseChart from "./BaseChart.js";
import merge from 'lodash.merge';
import { dateFormatter } from "../../settings/dateFormatter.js";
import { Loader } from "../../modules/myLoader.js";
import { createCalendar } from '../../settings/createCalendar.js';
import {
  getDashboardFinance,
  getFinancePlan,
} from '../../settings/request.js';

class ChartInflowArea extends BaseChart {
  constructor(ctx, addOptions = {}) {
    // Создаем и добавляем элемент тултипа ДО создания графика
    const wpChart = ctx.closest('.wp-chart');
    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'chart-tooltip';
    tooltipEl.style.opacity = '0';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.pointerEvents = 'none';

    const defaultOptions = {
      type: 'bar',
      data: {
        datasets: [{
          borderRadius: 4,
          barPercentage: 0.8,
          categoryPercentage: 0.9,
        }]
      },
      options: {
        layout: {
          padding: {
            top: 25
          }
        },
        scales: {
          y: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 10
              }
            },
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 10
              }
            }
          }
        },
        plugins: {
          tooltip: {
            enabled: false,
            position: 'average',
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
          }
        }
      },
      plugins: [{
        id: 'barLabels',
        afterDatasetsDraw: (chart) => {
          const ctx = chart.ctx;
          chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach((bar, index) => {
              const data = dataset.data[index];
              ctx.fillStyle = '#333';
              ctx.font = '400 10px Manrope';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';
              ctx.fillText(data, bar.x, bar.y - 5);
            });
          });
        }
      }]
    }

    super(ctx, merge({}, defaultOptions, addOptions))

    this.onExternal = this.onExternal.bind(this)
    this.wpChart = wpChart;
    this.tooltipEl = tooltipEl;

    // Устанавливаем HTML содержимое и добавляем в DOM
    this.tooltipEl.innerHTML = this.createTooltipHTML();
    this.wpChart.appendChild(this.tooltipEl);
    this.datasets = []

    this._loader = new Loader(this.wpChart, {
      id: 'loader-chart-inflow-area',
    });

    this.calendars = createCalendar(this.wpChart.querySelector('.input-date'), {
      mode: 'range',
      dateFormat: 'd. M, Y',
      defaultDate: this.app.defaultDate,
      onChange: (selectedDates, dateStr, instance) => {
        const [nameOne, nameTwo] = instance.element.name.split(',')

        if (selectedDates.length === 2) {
          const params = {
            warehouse_id: this.app.warehouse.warehouse_id,
            [nameOne]: dateFormatter(selectedDates[0], 'yyyy-MM-dd'),
            [nameTwo]: dateFormatter(selectedDates[1], 'yyyy-MM-dd')
          }

          // Сохраняем queryParams для использования в updateWidgets
          this.queryParams = {
            start_date: params[nameOne],
            end_date: params[nameTwo]
          };

          this.updateChartData(params);
        }
      }
    });
  }

  render() {
    if (!this.previousMonthsData) return
    const data = this.previousMonthsData.data.slice(-9)
    const rangeDates = this.previousMonthsData.previousRanges.slice(-9)

    this.chart.data.labels = rangeDates.map(range => {
      const date = new Date(range.start_date);
      return dateFormatter(date, 'LLLL');
    });
    this.chart.data.datasets[0].data = data.map(obj => obj.inflow_area || 0)

    this.datasets = data

    this.chart.update();
  }

  // Проверка, находятся ли даты в одном месяце
  isSameMonth(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  }

  // Метод для обновления данных графика
  async updateChartData(params) {
    try {
      this._loader.enable();

      const { start_date, end_date, warehouse_id } = params;

      // Проверяем, находятся ли даты в одном месяце
      if (this.isSameMonth(start_date, end_date)) {
        // Если внутри одного месяца - используем getFinancePlan
        const response = await getFinancePlan({
          warehouse_id,
          start_date,
          end_date
        });

        if (response && response.finance_planfact) {
          const data = response.finance_planfact;

          // Обновляем график
          this.chart.data.labels = data.map(item => {
            const date = new Date(item.data);
            return dateFormatter(date, 'dd');
          });
          this.chart.data.datasets[0].data = data.map(item => item.inflow_area || 0);
          this.chart.update();

          // Получаем данные по всем складам для тултипа
          // Вычисляем первый и последний день месяца
          const date = new Date(start_date);
          const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
          const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

          // Функция для форматирования даты
          const formatLocalDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };

          const monthStart = formatLocalDate(firstDay);
          const monthEnd = formatLocalDate(lastDay);

          // Фильтруем склады (исключаем warehouse_id === 0)
          const warehouses = window.app.warehouses.filter(w => w.warehouse_id !== 0);

          // Создаем параллельные запросы для каждого склада
          const warehouseRequests = warehouses.map(warehouse =>
            getFinancePlan({
              warehouse_id: warehouse.warehouse_id,
              start_date,
              end_date
            })
          );

          // Выполняем все запросы параллельно
          const warehouseResults = await Promise.all(warehouseRequests);

          // Сохраняем результаты в this.datasets для тултипа
          this.datasets = warehouseResults.map((result, index) => ({
            ...result,
            warehouse_id: warehouses[index].warehouse_id,
            warehouse_short_name: warehouses[index].warehouse_short_name
          }));
        }
      } else {
        // Если больше одного месяца - используем getDashboardFinance для каждого месяца
        const start = new Date(start_date);
        const end = new Date(end_date);

        // Функция для форматирования даты без учёта часового пояса
        const formatLocalDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        // Вычисляем количество месяцев в диапазоне
        const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;

        // Генерируем диапазоны для каждого месяца
        const ranges = [];
        for (let i = 0; i < monthsDiff; i++) {
          const monthStart = new Date(start.getFullYear(), start.getMonth() + i, 1);
          const monthEnd = new Date(start.getFullYear(), start.getMonth() + i + 1, 0);

          // Для каждого месяца используем полный месяц (с 1-го по последний день)
          const rangeStart = formatLocalDate(monthStart);
          const rangeEnd = formatLocalDate(monthEnd);

          ranges.push({
            start_date: rangeStart,
            end_date: rangeEnd
          });
        }

        // Выполняем запросы для всех месяцев параллельно
        const requests = ranges.map(range =>
          getDashboardFinance({
            warehouse_id,
            start_date: range.start_date,
            end_date: range.end_date
          })
        );

        const results = await Promise.all(requests);
        this.datasets = results

        // Обновляем график
        this.chart.data.labels = ranges.map(range => {
          const date = new Date(range.start_date);
          return dateFormatter(date, 'LLLL');
        });
        this.chart.data.datasets[0].data = results.map(result => result.inflow_area || 0);
        this.chart.update();
      }
    } catch (error) {
      console.error('Error обновления chart data:', error);
      window.app.notify.show({
        msg: `Ошибка при обновлении графика: ${error.message}`,
        msg_type: 'error'
      });
    } finally {
      this._loader.disable();
    }
  }

  // Метод создания HTML структуры тултипа
  createTooltipHTML() {
    return `
      <div class="sklad flex flex-col gap-1 items-start text-left">
      </div>
    `;
  }

  // Метод обновления содержимого тултипа
  onExternal(tooltipEl, chart, tooltip, dataI) {
    if (this.datasets && this.datasets.length) {
      const skladBlock = tooltipEl.querySelector('.sklad');
      skladBlock.innerHTML = '';

      // Проверяем структуру данных
      const firstItem = this.datasets[0];

      // Если есть finance_planfact в первом элементе - это данные для одного месяца
      if (firstItem.finance_planfact) {
        // Случай: один месяц - показываем все склады
        this.datasets.forEach(warehouse => {
          const data = warehouse.finance_planfact[dataI]
          skladBlock.insertAdjacentHTML('beforeend',
            `<p class="w-full">${warehouse.warehouse_short_name}: ${data.inflow_area}м²</p>`
          );
        });
      } else if (this.datasets[dataI] && this.datasets[dataI].inflow_area_by_warehouse) {
        // Случай: несколько месяцев - показываем склады для конкретного месяца
        const data = this.datasets[dataI];
        data.inflow_area_by_warehouse.forEach(({ inflow_area, warehouse_id }) => {
          const warehouse = window.app.warehouses.find(w => w.warehouse_id === warehouse_id);
          if (warehouse) {
            skladBlock.insertAdjacentHTML('beforeend',
              `<p class="w-full">${warehouse.warehouse_short_name}: ${inflow_area}м²</p>`
            );
          }
        });
      }
    }
  }
}

export default ChartInflowArea