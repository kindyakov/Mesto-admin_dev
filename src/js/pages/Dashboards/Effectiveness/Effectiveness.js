import Dashboards from '../Dashboards.js';
import flatpickr from "flatpickr";
import { Russian } from "flatpickr/dist/l10n/ru.js";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect/index.js";
import { dateFormatter } from '../../../settings/dateFormatter.js';
import {
  getDashboardFinance,
  getFinancePlan,
  getMotivationInfo
} from '../../../settings/request.js';

import TableMotivationManagers from '../../../components/Tables/TableMotivationManagers/TableMotivationManagers.js';

class Effectiveness extends Dashboards {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-motivation-managers',
          TableComponent: TableMotivationManagers,
          options: {
            paginationPageSize: 1000
          },
          params: {
            getData: getMotivationInfo
          }
        }
      ],
      page: 'dashboards/effectiveness'
    });

    const inputElement = this.wrapper.querySelector(`[data-content="dashboards/effectiveness"] .input-date-month`);

    if (inputElement) {
      const currentDate = new Date();
      currentDate.setDate(1);

      this.calendar = flatpickr(inputElement, {
        locale: Russian,
        disableMobile: true,
        plugins: [new monthSelectPlugin({
          shorthand: false,
          dateFormat: "F Y", // Формат отображения: Январь 2025
          theme: "light"
        })],
        defaultDate: currentDate,
        onChange: (selectedDates, dateStr, instance) => {
          if (selectedDates.length === 1) {
            const { startDate, endDate } = this.getMonthRange(selectedDates[0]);

            this.changeQueryParams({
              start_date: dateFormatter(startDate, 'yyyy-MM-dd'),
              end_date: dateFormatter(endDate, 'yyyy-MM-dd'),
              month: dateFormatter(selectedDates[0], 'yyyy-MM')
            });
          }
        },
        // onReady: (selectedDates, dateStr, instance) => {
        //   // Исправляем дублирование при инициализации
        //   // Плагин monthSelect может создавать дублирование, исправляем это
        //   setTimeout(() => {
        //     const inputValue = instance.input.value;
        //     // Если значение дублируется (содержит запятую), берем только первую часть
        //     if (inputValue && inputValue.includes(',')) {
        //       const cleanValue = inputValue.split(',')[0].trim();
        //       instance.input.value = cleanValue;
        //       // Если есть altInput, тоже обновляем его
        //       if (instance.altInput) {
        //         instance.altInput.value = cleanValue;
        //       }
        //     }
        //   }, 0);
        // }
      });

      if (this.calendar && this.calendar.selectedDates.length > 0) {
        const { startDate, endDate } = this.getMonthRange(this.calendar.selectedDates[0]);

        this.queryParams = {
          start_date: dateFormatter(startDate, 'yyyy-MM-dd'),
          end_date: dateFormatter(endDate, 'yyyy-MM-dd')
        };
      }
    }
  }

  /**
   * Получает первый и последний день месяца для указанной даты
   * @param {Date|string|number} date - Дата в месяце
   * @returns {{startDate: Date, endDate: Date}} - Объект с первым и последним днем месяца
   */
  getMonthRange(date) {
    const selectedDate = new Date(date);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    // Первый день месяца
    const startDate = new Date(year, month, 1);
    // Последний день месяца (0 день следующего месяца = последний день текущего)
    const endDate = new Date(year, month + 1, 0);

    return { startDate, endDate };
  }

  async getData(queryParams = {}) {
    return getMotivationInfo({ month: this.queryParams.month })
  }

  async getDashboardData(queryParams = {}) {
    return Promise.all([
      getDashboardFinance({
        warehouse_id: this.app.warehouse.warehouse_id,
        ...this.queryParams,
        ...queryParams
      }),
      getFinancePlan({ warehouse_id: warehouse.warehouse_id, ...queryParams })
    ]);
  }

  onRender([dataDashboard, { finance_planfact }], dataEntities) {
    let lastFinancePlanFact = finance_planfact.at(-1) || {};

    if (lastFinancePlanFact) {
      if (lastFinancePlanFact.revenue_accumulated && lastFinancePlanFact.revenue_accumulated_planned) {
        lastFinancePlanFact.revenue_accumulated_percent = ((lastFinancePlanFact.revenue_accumulated / lastFinancePlanFact.revenue_accumulated_planned) * 100).toFixed(0);
      } else {
        lastFinancePlanFact.revenue_accumulated_percent = 0;
      }

      if (lastFinancePlanFact.inflow_area_accumulated && lastFinancePlanFact.inflow_area_accumulated_planned) {
        lastFinancePlanFact.inflow_area_accumulated_percent = ((lastFinancePlanFact.inflow_area_accumulated / lastFinancePlanFact.inflow_area_accumulated_planned) * 100).toFixed(0);
      } else {
        lastFinancePlanFact.inflow_area_accumulated_percent = 0;
      }

      if (lastFinancePlanFact.revenue_accumulated_percent && lastFinancePlanFact.inflow_area_accumulated_percent) {
        lastFinancePlanFact.efficiency_coefficient = ((0.5 * lastFinancePlanFact.revenue_accumulated_percent) + (0.5 * lastFinancePlanFact.inflow_area_accumulated_percent)).toFixed(0);
      } else {
        lastFinancePlanFact.efficiency_coefficient = 0;
      }

      if (lastFinancePlanFact.reestr_revenue && lastFinancePlanFact.reestr_sum) {
        lastFinancePlanFact.reestr_revenue_percent = ((lastFinancePlanFact.reestr_revenue / lastFinancePlanFact.reestr_sum) * 100).toFixed(0);
      } else {
        lastFinancePlanFact.reestr_revenue_percent = 0;
      }
    }

    this.renderWidgets({
      ...dataDashboard,
      ...lastFinancePlanFact
    });

    console.log('Оклад', dataEntities.oklad);


    if (dataEntities) {
      this.actionsTables((table, i) => {
        table.onRendering(dataEntities);
      });
    }

  }
}

export default Effectiveness;
