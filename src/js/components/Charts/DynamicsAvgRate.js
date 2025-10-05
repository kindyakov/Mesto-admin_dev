import BaseChart from "./BaseChart.js";
import merge from 'lodash.merge';
// import { formattingPrice } from '../../utils/formattingPrice.js';
import { getDashboardFinance } from '../../settings/request.js';
import { dateFormatter } from "../../settings/dateFormatter.js";
import { Loader } from "../../modules/myLoader.js";

class DynamicsAvgRate extends BaseChart {
  constructor(ctx, addOptions = {}) {
    const defaultOptions = {
      type: 'bar',
      data: {
        // labels: ['10', '11', '12', '01', '02', '03', '04', '05', '06', '07', '08', '09'],
        datasets: [{
          // data: [3500, 3600, 3650, 3725, 3700, 3730, 3750, 3750, 3790, 3800, 3800, 3850],
          backgroundColor: '#5782a1',
          borderRadius: 4,
          barThickness: 20,
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
                size: 12
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
      id: 'loader-chart-dynamics-avg-rate',
    });
  }

  async render() {
    try {
      this._loader.enable()

      const currentStartDate = this.queryParams.start_date;
      const currentEndDate = this.queryParams.end_date;

      // Функция для получения диапазона предыдущих месяцев
      const getPreviousMonthsRanges = (startDate, endDate, monthsCount = 3) => {
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

      // Получаем диапазоны для предыдущих 3 месяцев
      const previousRanges = getPreviousMonthsRanges(currentStartDate, currentEndDate, 3).reverse();

      // Формируем массив всех запросов
      const requests = [
        // Основной запрос
        getDashboardFinance({
          warehouse_id: this.app.warehouse.warehouse_id,
          end_date: currentEndDate || "",
          start_date: currentStartDate || ""
        }),
        // Запросы за предыдущие месяцы
        ...previousRanges.map(range =>
          getDashboardFinance({
            warehouse_id: this.app.warehouse.warehouse_id,
            start_date: range.start_date,
            end_date: range.end_date
          })
        )
      ];

      // Выполняем все запросы параллельно
      const [currentData, ...previousMonthsData] = await Promise.all(requests);

      this.chart.data.labels = previousRanges.map(range => {
        const date = new Date(range.start_date);
        return dateFormatter(date, 'LLLL');
      });
      this.chart.data.datasets[0].data = previousMonthsData.map(obj => obj.current_avg_price_per_room || 0)

      this.chart.update();
    } catch (error) {
      throw error;
    } finally {
      this._loader.disable()
    }
  }
}

export default DynamicsAvgRate