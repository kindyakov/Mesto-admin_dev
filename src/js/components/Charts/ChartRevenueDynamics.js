import BaseChart from "./BaseChart.js";
import merge from 'lodash.merge';
import { dateFormatter } from "../../settings/dateFormatter.js";
import { Loader } from "../../modules/myLoader.js";
import { createCalendar } from '../../settings/createCalendar.js';
import {
  getDashboardFinance,
  getFinancePlan,
} from '../../settings/request.js';
import { formattingPrice } from "../../utils/formattingPrice.js";
import ColorManager from "../../utils/ColorManager.js";
import { Chart } from 'chart.js';

class ChartRevenueDynamics extends BaseChart {
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
          backgroundColor: '#5782a1',
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
                size: 9
              }
            },
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 9
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
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const dataIndex = elements[0].index;
            this.handleBarClick(dataIndex);
          }
        }
      },
    }

    super(ctx, merge({}, defaultOptions, addOptions))

    this.onExternal = this.onExternal.bind(this)
    this.wpChart = wpChart;
    this.tooltipEl = tooltipEl;

    // Устанавливаем HTML содержимое и добавляем в DOM
    this.tooltipEl.innerHTML = this.createTooltipHTML();
    this.wpChart.appendChild(this.tooltipEl);
    this.datasets = []

    // State for selected bars
    this.selectedBars = new Set(); // Store indices of selected bars
    this.selectionChart = null; // Reference to ChartRevenueSelection

    this._loader = new Loader(this.wpChart, {
      id: 'loader-chart-inflow-area',
    });

    this.calendars = createCalendar(this.wpChart.querySelector('.input-date'), {
      mode: 'range',
      dateFormat: 'd. M, Y',
      defaultDate: [new Date(2024, 4, 1), new Date()],
      onChange: (selectedDates, dateStr, instance) => {
        const [nameOne, nameTwo] = instance.element.name.split(',')

        if (selectedDates.length === 2) {
          // Очищаем выбранные колонки при изменении календаря
          this.selectedBars.clear();
          this.updateBarHighlighting(); // Сбрасываем цвета

          // Очищаем круговую диаграмму
          if (this.selectionChart) {
            this.selectionChart.clearData();
          }

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

    this.initialRender = true
  }

  render() {
    if (!this.previousMonthsData) return
    const data = this.previousMonthsData.data.slice(-9)
    const rangeDates = this.previousMonthsData.previousRanges.slice(-9)

    // this.chart.data.labels = rangeDates.map(range => {
    //   const date = new Date(range.start_date);
    //   return dateFormatter(date, 'LLLL');
    // });
    // this.chart.data.datasets[0].data = data.map(obj => obj.revenue || 0)

    this.datasets = data

    if (this.initialRender) {
      // Форматируем даты для сохранения в queryParams
      this.queryParams = {
        start_date: "2024-05-01",
        end_date: dateFormatter(new Date(), "yyyy-MM-dd")
      };

      // Автоматически загружаем данные с датами по умолчанию при первой загрузке
      if (this.app.warehouse && this.app.warehouse.warehouse_id !== undefined) {
        const defaultParams = {
          warehouse_id: this.app.warehouse.warehouse_id,
          start_date: this.queryParams.start_date,
          end_date: this.queryParams.end_date
        };
        this.updateChartData(defaultParams);
        this.initialRender = false
      }
    } else {
      this.chart.update();
    }
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
          this.chart.data.datasets[0].data = data.map(item => item.revenue || 0);
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

          // Автоматически выбираем и подсвечиваем последний столбец
          const lastDayIndex = this.datasets[0].finance_planfact.length - 1;
          this.selectedBars.add(lastDayIndex);
          this.updateBarHighlighting();

          // Автоматически обновляем круговую диаграмму данными за последний день
          this.updateSelectionChartForLastDay();
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
        this.labels = ranges

        // Обновляем график
        this.chart.data.labels = ranges.map(range => {
          const date = new Date(range.start_date);
          return dateFormatter(date, 'LLLL');
        });
        this.chart.data.datasets[0].data = results.map(result => result.revenue || 0);
        this.chart.update();

        // Автоматически выбираем и подсвечиваем последний столбец (месяц)
        const lastMonthIndex = this.datasets.length - 1;
        this.selectedBars.add(lastMonthIndex);
        this.updateBarHighlighting();

        // Автоматически обновляем круговую диаграмму данными за последний месяц
        this.updateSelectionChartForLastMonth();
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

  // Handle click on bar chart
  handleBarClick(dataIndex) {
    // Toggle selection for the clicked bar
    if (this.selectedBars.has(dataIndex)) {
      this.selectedBars.delete(dataIndex);
    } else {
      this.selectedBars.add(dataIndex);
    }

    // Update visual highlighting
    this.updateBarHighlighting();

    // Update selection chart with aggregated data
    this.updateSelectionChart();
  }

  // Update visual highlighting of selected bars
  updateBarHighlighting() {
    if (!this.chart || !this.chart.data.datasets[0]) return;

    const dataset = this.chart.data.datasets[0];
    const colors = this.chart.data.labels.map((_, index) => {
      // Always use green for selected bars, default color for unselected
      if (this.selectedBars.has(index)) {
        return '#19D06D'; // Always green for selected bars
      }
      return ColorManager.COLORS.DEFAULT_BAR; // Default color for unselected
    });

    // Update background colors with green highlighting for selected bars
    dataset.backgroundColor = colors;
    this.chart.update('none'); // Update without animation for immediate feedback
  }

  // Update selection chart with aggregated data from selected periods
  updateSelectionChart() {
    if (!this.selectionChart) {
      this.findSelectionChart();
    }

    if (!this.selectionChart || this.selectedBars.size === 0) {
      if (this.selectionChart) {
        this.selectionChart.clearData();
      }
      return;
    }

    const aggregatedData = this.aggregateSelectedData();

    if (aggregatedData.length === 0) {
      this.selectionChart.clearData();
      return;
    }

    // Check if the selectionChart has the renderForSelection method
    if (typeof this.selectionChart.renderForSelection !== 'function') {
      return;
    }

    const colorMapping = ColorManager.createWarehouseColorMapping(
      new Map(aggregatedData.map(w => [w.warehouse_id, w]))
    );

    this.selectionChart.renderForSelection(
      colorMapping.labels,
      colorMapping.data,
      colorMapping.colors
    );
  }

  // Поиск ссылки на ChartRevenueSelection
  findSelectionChart() {
    // Если ссылка уже установлена Finance.js, используем её
    if (this.selectionChart) {
      return;
    }

    // Способ 1: Ищем через page.charts (работает и в разработке, и в продакшене)
    const page = this.page || this.app?.page;
    if (page && page.charts) {
      // Ищем по ID канваса вместо имени класса (работает после минификации)
      const chart = page.charts.find(c =>
        c.canvas && c.canvas.id === 'chart-revenue-selection'
      );
      if (chart) {
        this.selectionChart = chart;
        return;
      }
    }

    // Способ 2: Ищем через элемент канваса
    const selectionChartCanvas = document.querySelector('#chart-revenue-selection');
    if (selectionChartCanvas) {
      try {
        // Проверяем, хранится ли наш экземпляр на элементе канваса
        if (selectionChartCanvas.chart && selectionChartCanvas.chart.canvas === selectionChartCanvas) {
          this.selectionChart = selectionChartCanvas.chart;
          return;
        }

        // Ищем глобально все экземпляры графиков с нужным ID канваса
        const allCharts = [];

        // Проверяем возможные места хранения в window.app
        if (window.app) {
          // Проверяем, есть ли в app страницы с графиками
          if (window.app.pages) {
            Object.values(window.app.pages).forEach(pageObj => {
              if (pageObj.charts) allCharts.push(...pageObj.charts);
            });
          }

          // Проверяем, есть ли в app графики напрямую
          if (window.app.charts) allCharts.push(...window.app.charts);
        }

        const revenueSelectionChart = allCharts.find(chart =>
          chart.canvas && chart.canvas.id === 'chart-revenue-selection'
        );

        if (revenueSelectionChart) {
          this.selectionChart = revenueSelectionChart;
          return;
        }

      } catch (error) {
        // Ошибка при поиске экземпляров
      }
    }
  }

  // Aggregate warehouse data from selected periods
  aggregateSelectedData() {
    const warehouseMap = new Map();

    // Check if we're in single month mode
    if (this.datasets[0]?.finance_planfact) {
      this.selectedBars.forEach(dayIndex => {
        this.datasets.forEach(warehouseData => {
          const dayData = warehouseData.finance_planfact[dayIndex];
          const dayRevenue = dayData?.revenue || 0;

          if (dayRevenue > 0) {
            if (!warehouseMap.has(warehouseData.warehouse_id)) {
              warehouseMap.set(warehouseData.warehouse_id, {
                warehouse_id: warehouseData.warehouse_id,
                warehouse_short_name: warehouseData.warehouse_short_name,
                revenue: 0
              });
            }

            warehouseMap.get(warehouseData.warehouse_id).revenue += dayRevenue;
          }
        });
      });
    } else {
      this.selectedBars.forEach(barIndex => {
        if (this.datasets[barIndex]?.revenues_by_warehouse) {
          const monthlyData = this.datasets[barIndex];
          monthlyData.revenues_by_warehouse.forEach(warehouse => {
            if (!warehouseMap.has(warehouse.warehouse_id)) {
              const warehouseInfo = window.app.warehouses.find(w => w.warehouse_id === warehouse.warehouse_id);
              warehouseMap.set(warehouse.warehouse_id, {
                warehouse_id: warehouse.warehouse_id,
                warehouse_short_name: warehouseInfo?.warehouse_short_name || `WH${warehouse.warehouse_id}`,
                revenue: 0
              });
            }
            warehouseMap.get(warehouse.warehouse_id).revenue += warehouse.revenue;
          });
        }
      });
    }

    return Array.from(warehouseMap.values());
  }

  // Update selection chart with data for the last day (single month mode)
  updateSelectionChartForLastDay() {
    if (!this.selectionChart) {
      this.findSelectionChart();
    }

    if (!this.selectionChart || !this.datasets || this.datasets.length === 0) {
      if (this.selectionChart) {
        this.selectionChart.clearData();
      }
      return;
    }

    // Check if the selectionChart has the renderForSelection method
    if (typeof this.selectionChart.renderForSelection !== 'function') {
      return;
    }

    const warehouseMap = new Map();
    const lastDayIndex = this.datasets[0].finance_planfact.length - 1;

    // Aggregate data from all warehouses for the last day
    this.datasets.forEach(warehouseData => {
      const dayData = warehouseData.finance_planfact[lastDayIndex];
      const dayRevenue = dayData?.revenue || 0;

      if (dayRevenue > 0) {
        if (!warehouseMap.has(warehouseData.warehouse_id)) {
          warehouseMap.set(warehouseData.warehouse_id, {
            warehouse_id: warehouseData.warehouse_id,
            warehouse_short_name: warehouseData.warehouse_short_name,
            revenue: 0
          });
        }
        warehouseMap.get(warehouseData.warehouse_id).revenue += dayRevenue;
      }
    });

    const aggregatedData = Array.from(warehouseMap.values());
    if (aggregatedData.length > 0) {
      const colorMapping = ColorManager.createWarehouseColorMapping(
        new Map(aggregatedData.map(w => [w.warehouse_id, w]))
      );
      this.selectionChart.renderForSelection(
        colorMapping.labels,
        colorMapping.data,
        colorMapping.colors
      );
    } else {
      this.selectionChart.clearData();
    }
  }

  // Update selection chart with data for the last month (multi-month mode)
  updateSelectionChartForLastMonth() {
    if (!this.selectionChart) {
      this.findSelectionChart();
    }

    if (!this.selectionChart || !this.datasets || this.datasets.length === 0) {
      if (this.selectionChart) {
        this.selectionChart.clearData();
      }
      return;
    }

    // Check if the selectionChart has the renderForSelection method
    if (typeof this.selectionChart.renderForSelection !== 'function') {
      return;
    }

    // Take data from the last month
    const lastMonthData = this.datasets[this.datasets.length - 1];

    if (lastMonthData && lastMonthData.revenues_by_warehouse) {
      const warehouseMap = new Map();

      lastMonthData.revenues_by_warehouse.forEach(warehouse => {
        if (!warehouseMap.has(warehouse.warehouse_id)) {
          const warehouseInfo = window.app.warehouses.find(w => w.warehouse_id === warehouse.warehouse_id);
          warehouseMap.set(warehouse.warehouse_id, {
            warehouse_id: warehouse.warehouse_id,
            warehouse_short_name: warehouseInfo?.warehouse_short_name || `WH${warehouse.warehouse_id}`,
            revenue: 0
          });
        }
        warehouseMap.get(warehouse.warehouse_id).revenue += warehouse.revenue;
      });

      const aggregatedData = Array.from(warehouseMap.values());
      const colorMapping = ColorManager.createWarehouseColorMapping(
        new Map(aggregatedData.map(w => [w.warehouse_id, w]))
      );
      this.selectionChart.renderForSelection(
        colorMapping.labels,
        colorMapping.data,
        colorMapping.colors
      );
    } else {
      this.selectionChart.clearData();
    }
  }

  // Метод создания HTML структуры тултипа
  createTooltipHTML() {
    return `
      <div class="sklad flex flex-col gap-0.5 items-start text-left text-xs">
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
        const revenueSum = this.datasets.map(warehouse => warehouse.finance_planfact[dataI].revenue).reduce((acc, cur) => acc + cur, 0);
        const { data: date } = firstItem.finance_planfact[dataI];

        skladBlock.insertAdjacentHTML('beforeend',
          `<p class="w-full">${date ? dateFormatter(new Date(date), 'dd MMMM yyyy') : ''}</p>
          <p class="w-full" style="margin-bottom: 10px;">Сумма: ${formattingPrice(revenueSum)}</p>`
        );
        // Случай: один месяц - показываем все склады
        this.datasets.forEach(warehouse => {
          const data = warehouse.finance_planfact[dataI]
          skladBlock.insertAdjacentHTML('beforeend',
            `<p class="w-full" style="color: ${warehouse.warehouse_id === window.app.warehouse.warehouse_id ? '#007bff' : ''};">${warehouse.warehouse_short_name}: ${formattingPrice(data.revenue)}</p>`
          );
        });
      } else if (this.datasets[dataI] && this.datasets[dataI].revenues_by_warehouse) {
        // Случай: несколько месяцев - показываем склады для конкретного месяца
        const data = this.datasets[dataI];
        const label = this.labels[dataI];
        const revenueSum = data.revenues_by_warehouse.reduce((acc, cur) => acc + cur.revenue, 0);

        skladBlock.insertAdjacentHTML('beforeend',
          `<p class="w-full">${label ? dateFormatter(new Date(label.start_date), 'LLLL yyyy') : ''}</p>
          <p class="w-full" style="margin-bottom: 10px;">Сумма: ${formattingPrice(revenueSum)}</p>`
        );
        data.revenues_by_warehouse.forEach(({ revenue, warehouse_id }) => {
          const warehouse = window.app.warehouses.find(w => w.warehouse_id === warehouse_id);
          if (warehouse) {
            skladBlock.insertAdjacentHTML('beforeend',
              `<p class="w-full" style="color: ${warehouse_id === window.app.warehouse.warehouse_id ? '#007bff' : ''};">${warehouse.warehouse_short_name}: ${formattingPrice(revenue)}</p>`
            );
          }
        });
      }
    }
  }
}

export default ChartRevenueDynamics