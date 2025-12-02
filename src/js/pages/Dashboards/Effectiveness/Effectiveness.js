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
import EditEffectivenessUtils from './EditEffectivenessUtils.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';

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
            getData: getMotivationInfo,
            newClientsRevenueRent: null
          }
        }
      ],
      page: 'dashboards/effectiveness'
    });

    this.editEffectivenessUtils = null;
    // Объект для хранения отредактированных значений
    this.editedValues = {};
    // Сохраняем последние данные для пересчета процентов
    this.lastRenderData = null;

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
      });

      if (this.calendar && this.calendar.selectedDates.length > 0) {
        const { startDate, endDate } = this.getMonthRange(this.calendar.selectedDates[0]);

        this.queryParams = {
          start_date: dateFormatter(startDate, 'yyyy-MM-dd'),
          end_date: dateFormatter(endDate, 'yyyy-MM-dd'),
          month: dateFormatter(this.calendar.selectedDates[0], 'yyyy-MM')
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

  /**
   * Рассчитывает доход менеджера
   * @param {number} oklad - Оклад менеджера
   * @param {number} reestrRevenue - Выручка
   * @param {number} reestrSumWas - Базовая сумма для расчета
   * @returns {number} Рассчитанный доход менеджера
   */
  calculateManagerRevenue(oklad, reestrRevenue, reestrSumWas, new_clients_revenue_rent = 0) {
    let bonus = 0;

    if (this.motivationInfo && this.motivationInfo.length > 0) {
      const motivation = this.motivationInfo.find(item =>
        new_clients_revenue_rent >= item.gradation_start &&
        new_clients_revenue_rent <= item.gradation_end
      );

      if (motivation) {
        bonus = motivation.bonus_percent / 100;
      }
    }

    if (reestrRevenue && reestrSumWas && oklad) {
      return +((oklad + bonus * new_clients_revenue_rent) * reestrRevenue / reestrSumWas).toFixed(0);
    }
    return 0;
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
      getFinancePlan({ warehouse_id: this.app.warehouse.warehouse_id, ...this.queryParams, ...queryParams })
    ]);
  }

  /**
   * Обновляет подсветку в таблице мотивации менеджеров
   * @param {number} newClientsRevenueRent - Значение новых клиентов для подсветки
   */
  updateMotivationTableHighlighting(newClientsRevenueRent) {
    if (newClientsRevenueRent && this.tables.length > 0) {
      const motivationTable = this.tables[0];
      if (motivationTable) {
        // Обновляем значение подсветки
        motivationTable.newClientsRevenueRent = newClientsRevenueRent;
        // Если таблица уже проинициализирована, обновляем отображение
        if (motivationTable.gridApi) {
          motivationTable.updateHighlighting(newClientsRevenueRent);
        }
      }
    }
  }

  onRender([dataDashboard, { finance_planfact }], dataEntities) {
    let lastFinancePlanFact = finance_planfact.at(-1) || {};
    this.oklad = dataEntities.oklad || 0;
    this.motivationInfo = dataEntities?.motivation_info || [];

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
    }

    if (dataDashboard) {
      if (dataDashboard.reestr_revenue && dataDashboard.reestr_sum_was) {
        dataDashboard.reestr_revenue_percent = ((dataDashboard.reestr_revenue / dataDashboard.reestr_sum_was) * 100).toFixed(0);
      } else {
        dataDashboard.reestr_revenue_percent = 0;
      }

      dataDashboard.total_manager_revenue = this.calculateManagerRevenue(
        dataEntities?.oklad,
        dataDashboard.reestr_revenue,
        dataDashboard.reestr_sum_was,
        dataDashboard.new_clients_revenue_rent
      );
    }

    // Сохраняем данные для последующего использования в updateWidgets
    this.lastRenderData = {
      dataDashboard,
      lastFinancePlanFact
    };

    this.renderWidgets({
      ...dataDashboard,
      ...lastFinancePlanFact,
    });


    // Передаем new_clients_revenue_rent в таблицу мотивации менеджеров
    this.updateMotivationTableHighlighting(dataDashboard?.new_clients_revenue_rent);

    if (dataEntities) {
      this.actionsTables((table, i) => {
        table.onRendering(dataEntities);
        table.queryParams = {
          ...table.queryParams,
          month: this.queryParams.month,
          oklad: dataEntities.oklad,
        }
      });
    }

    this.initEditEffectivenessUtils();
  }

  initEditEffectivenessUtils() {
    if (this.editEffectivenessUtils) {
      this.editEffectivenessUtils = null;
    }

    this.editEffectivenessUtils = new EditEffectivenessUtils(
      this.wrapper,
      this.editedValues,
      () => {
        // Callback для обновления виджетов после сохранения
        this.updateWidgets();
      }
    );
  }

  updateWidgets() {
    if (!this.lastRenderData) {
      return;
    }

    const { dataDashboard, lastFinancePlanFact } = this.lastRenderData;
    const reestr_revenue = this.editedValues.reestr_revenue || dataDashboard.reestr_revenue || 0;
    const new_clients_revenue_rent = this.editedValues.new_clients_revenue_rent || dataDashboard.new_clients_revenue_rent || 0;
    // Если обновляется reestr_revenue, пересчитываем reestr_revenue_percent
    if (reestr_revenue) {
      const reestr_sum_was = dataDashboard.reestr_sum_was;

      if (reestr_revenue && reestr_sum_was) {
        dataDashboard.reestr_revenue_percent = +((reestr_revenue / reestr_sum_was) * 100).toFixed(0);
      } else {
        dataDashboard.reestr_revenue_percent = 0;
      }

      dataDashboard.total_manager_revenue = this.calculateManagerRevenue(
        this.oklad,
        reestr_revenue,
        dataDashboard.reestr_sum_was,
        new_clients_revenue_rent
      );
    }

    // Обновляем виджеты с отредактированными значениями
    Object.keys(this.editedValues).forEach(key => {
      const widget = this.wrapper.querySelector(`[data-render-widget="${key}"]`);
      if (widget) {
        const value = this.editedValues[key];
        if (widget.hasAttribute('price')) {
          widget.textContent = formattingPrice(value);
        } else {
          widget.textContent = value;
        }
      }
    });

    // Перерисовываем все виджеты с учетом отредактированных значений
    const updatedData = {
      ...dataDashboard,
      ...lastFinancePlanFact,
      ...this.editedValues
    };

    this.renderWidgets(updatedData);

    // Обновляем подсветку в таблице мотивации, если изменилось new_clients_revenue_rent
    this.updateMotivationTableHighlighting(new_clients_revenue_rent);
  }
}

export default Effectiveness;
