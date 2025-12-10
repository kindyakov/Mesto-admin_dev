import Dashboards from '../Dashboards.js';
import flatpickr from "flatpickr";
import { Russian } from "flatpickr/dist/l10n/ru.js";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect/index.js";
import { dateFormatter } from '../../../settings/dateFormatter.js';
import TableBudget from '../../../components/Tables/TableBudget/TableBudget.js';
import { getBudgetPlan } from '../../../settings/request.js';


class Budget extends Dashboards {
  constructor({ loader, pageName }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-budget',
          TableComponent: TableBudget,
          options: {
            paginationPageSize: 15
          },
          params: {
            // getData: postFuturePayments
          }
        }
        // {
        //   tableSelector: '.table-payments-business',
        //   TableComponent: TableUpcomingPayments,
        //   options: {
        //     paginationPageSize: 1000
        //   },
        //   params: {
        //     getData: postFuturePayments
        //   }
        // }
      ],
      page: pageName
    });

    const inputElement = this.wrapper.querySelector(`.input-date-month`);

    if (inputElement) {
      const currentDate = new Date();
      currentDate.setDate(1);
      const defaultDate = [currentDate, currentDate];

      this.calendar = flatpickr(inputElement, {
        locale: Russian,
        disableMobile: true,
        mode: 'range',
        plugins: [new monthSelectPlugin({
          shorthand: false,
          dateFormat: "F Y", // Формат отображения: Январь 2025
          theme: "light"
        })],
        defaultDate,
        onChange: (selectedDates, dateStr, instance) => {
          if (selectedDates.length === 2) {
            const [startDate, endDate] = selectedDates

            this.changeQueryParams({
              start_date: dateFormatter(startDate, 'yyyy-MM'),
              end_date: dateFormatter(endDate, 'yyyy-MM'),
            });
          }
        },
      });

      if (this.calendar && this.calendar.selectedDates.length === 2) {
        const [startDate, endDate] = this.calendar.selectedDates

        this.queryParams = {
          start_date: dateFormatter(startDate, 'yyyy-MM'),
          end_date: dateFormatter(endDate, 'yyyy-MM'),
        };
      }
    }
  }

  async getData(queryParams = {}) {
    return getBudgetPlan({ ...this.queryParams, ...queryParams })
  }


  onRender(data) {

  }
}

export default Budget;
