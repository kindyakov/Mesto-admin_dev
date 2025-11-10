import BaseChart from "./BaseChart.js";
import merge from 'lodash.merge';
import { dateFormatter } from "../../settings/dateFormatter.js";
import { Loader } from "../../modules/myLoader.js";
import { createCalendar } from '../../settings/createCalendar.js';
import {
  getDashboardFinance,
  getFinancePlan,
} from '../../settings/request.js';
import { getPreviousMonthsRanges } from '../../utils/getPreviousMonthsRanges.js';

class ChartInflowArea extends BaseChart {
  constructor(ctx, addOptions = {}) {
    const defaultOptions = {
      type: 'bar',
      data: {
        // labels: ['10', '11', '12', '01', '02', '03', '04', '05', '06', '07', '08', '09'],
        datasets: [{
          // data: [3500, 3600, 3650, 3725, 3700, 3730, 3750, 3750, 3790, 3800, 3800, 3850],
          backgroundColor: '#5782a1',
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

    this.wpChart = this.chart.canvas.closest('.wp-chart')

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
        }
      } else {
        // Если больше одного месяца - используем getDashboardFinance для каждого месяца
        const start = new Date(start_date);
        const end = new Date(end_date);

        // Вычисляем количество месяцев в диапазоне
        const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;

        // Генерируем диапазоны для каждого месяца
        const ranges = [];
        for (let i = 0; i < monthsDiff; i++) {
          const monthStart = new Date(start.getFullYear(), start.getMonth() + i, 1);
          const monthEnd = new Date(start.getFullYear(), start.getMonth() + i + 1, 0);

          // Для первого месяца используем start_date
          const rangeStart = i === 0 ? start_date : monthStart.toISOString().split('T')[0];
          // Для последнего месяца используем end_date
          const rangeEnd = i === monthsDiff - 1 ? end_date : monthEnd.toISOString().split('T')[0];

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
}

export default ChartInflowArea