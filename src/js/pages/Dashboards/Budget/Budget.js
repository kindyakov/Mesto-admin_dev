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
            paginationPageSize: 1000
          },
          params: {
            getData: getBudgetPlan
          }
        }
      ],
      page: pageName
    });

    this.btnPlan = this.wrapper.querySelector('.btn-budget-plan');
    this.btnFact = this.wrapper.querySelector('.btn-budget-fact');
    this.showPlan = false;
    this.showFact = true;

    this.initToggleButtons();

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
          // shorthand: false,
          dateFormat: "F Y", // Формат отображения: Январь 2025
          // theme: "light"
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

  initToggleButtons() {
    if (!this.btnPlan || !this.btnFact || !this.tables?.length) return;

    const table = this.tables[0];
    const updateButtons = () => {
      this.btnPlan.classList.toggle('active', this.showPlan);
      this.btnFact.classList.toggle('active', this.showFact);
    };

    const applyMode = () => table.setDisplayMode({ showPlan: this.showPlan, showFact: this.showFact });

    this.btnPlan.addEventListener('click', () => {
      this.showPlan = !this.showPlan;
      if (!this.showPlan && !this.showFact) this.showFact = true;
      updateButtons();
      applyMode();
    });

    this.btnFact.addEventListener('click', () => {
      this.showFact = !this.showFact;
      if (!this.showPlan && !this.showFact) this.showPlan = true;
      updateButtons();
      applyMode();
    });

    // начальное состояние: только Факт
    this.showPlan = false;
    this.showFact = true;
    updateButtons();
    applyMode();
  }

  async getData(queryParams = {}) {
    return getBudgetPlan({ ...this.queryParams, ...queryParams })
  }


  onRender(data) {
    this.actionsTables((table, i) => {
      table.queryParams = {
        ...table.queryParams, end_date: this.queryParams.end_date, start_date: this.queryParams.start_date
      }
      table.onChangeQueryParams = () => ({
        end_date: this.queryParams.end_date,
        start_date: this.queryParams.start_date
      })
    });
  }
}

export default Budget;
