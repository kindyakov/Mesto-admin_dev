import Dashboards from "../Dashboards.js";
import TableUpcomingPayments from "../../../components/Tables/TableUpcomingPayments/TableUpcomingPayments.js"
// import ChartMonthlyRevenue from "../../../components/Charts/ChartMonthlyRevenue/ChartMonthlyRevenue.js";
import ChartRegistrationFees from "../../../components/Charts/ChartRegistrationFees/ChartRegistrationFees.js";
import ChartFeesNewCustomers from "../../../components/Charts/ChartFeesNewCustomers/ChartFeesNewCustomers.js";
import { getDashboardFinance, getFuturePayments, getFinancePlan } from "../../../settings/request.js";
import { formattingPrice } from "../../../utils/formattingPrice.js";
// import RangeSlider from "../../../components/RangeSlider/RangeSlider.js";
// import { formattingPrice } from "../../../utils/formattingPrice.js";

function getFirstAndLastDayOfMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Создаем дату для первого дня месяца
  const firstDay = new Date(year, month, 1);

  // Создаем дату для следующего месяца и вычитаем один день,
  // чтобы получить последний день текущего месяца
  const lastDay = new Date(year, month + 1, 0);

  return [firstDay, lastDay]
}

class Finance extends Dashboards {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-payments',
          TableComponent: TableUpcomingPayments,
          params: { getData: getFuturePayments }
        }
      ],
      charts: [
        { id: 'chart-registration-fees', ChartComponent: ChartRegistrationFees },
        { id: 'chart-fees-new-customers', ChartComponent: ChartFeesNewCustomers },
        // { id: 'chart-monthly-revenue', ChartComponent: ChartMonthlyRevenue },
      ],
      page: 'dashboards/finance'
    });
  }

  async getData(queryParams = {}) {
    return getFuturePayments({ show_cnt: this.tables[0].gridOptions.paginationPageSize, ...queryParams });
  }

  async getDashboardData(queryParams = {}) {
    return Promise.all([getDashboardFinance({ ...this.queryParams, ...queryParams }), getFinancePlan(queryParams)])
  }


  // initRanges({ dataDashboard, finance_planfact, dataEntities }) {
  //   const today = new Date();
  //   const year = today.getFullYear();
  //   const month = today.getMonth(); // месяц начинается с 0
  //   const lastDayOfCurrentMonth = new Date(year, month + 1, 0);
  //   let revenue = 0, tooltipFact = null

  //   const options = {
  //     start: today.getDate(),
  //     connect: true,
  //     step: 1,
  //     range: {
  //       'min': 1,
  //       'max': lastDayOfCurrentMonth.getDate()
  //     },
  //     tooltips: true,
  //     pips: {
  //       mode: 'count',
  //       values: 31,
  //       density: 3,
  //       stepped: true
  //     },
  //   }

  //   if (dataDashboard?.revenue_by_month.length) {
  //     this.rangeFact = new RangeSlider(this.wrapper.querySelector('.range-fact'), options)
  //     tooltipFact = this.rangeFact.sliderElement.querySelector('.noUi-tooltip')
  //     revenue = dataDashboard.this_month_revenue
  //     tooltipFact.innerText = formattingPrice(revenue)
  //   }

  //   if (finance_planfact?.length) {
  //     const filteredData = finance_planfact.filter(item => {
  //       const date = new Date(item.data);
  //       return date.getFullYear() === year && (date.getMonth()) === month;
  //     });

  //     const dailyRevenues = new Array(31).fill(0);
  //     let cumulativeRevenue = 0;

  //     filteredData.forEach((item, i) => {
  //       cumulativeRevenue += item.revenue_planned;
  //       dailyRevenues[i] = cumulativeRevenue;
  //     });

  //     this.rangePlan = new RangeSlider(this.wrapper.querySelector('.range-plan'), options)

  //     function update({ values, handle, noUiSlider }) {
  //       const tooltip = noUiSlider.target?.querySelector('.noUi-tooltip') || noUiSlider.sliderElement.querySelector('.noUi-tooltip')
  //       const value = dailyRevenues[+Math.round(values[handle]) - 1];
  //       tooltip.innerText = formattingPrice(value)
  //       if (revenue => value) {
  //         tooltipFact.style.cssText = `color: #0b704e; background-color: #cff1e6;`
  //       } else {
  //         tooltipFact.style.cssText = `color: #d42424; background-color: #ffdbdb;`
  //       }
  //     }

  //     update({ values: [today.getDate()], handle: 0, noUiSlider: this.rangePlan })

  //     this.rangePlan.onSliderUpdate = update
  //   }
  // }

  visualization({ dataDashboard, finance_planfact, dataEntities }) {
    const fact = this.wrapper.querySelector('.visualization-fact')
    const plan = this.wrapper.querySelector('.visualization-plan')
    const remainsDeposit = this.wrapper.querySelector('.visualization-remains-deposit')

    const currentDay = new Date().getDate();
    const [currentD] = finance_planfact.filter((d, i) => (i + 1) == currentDay)

    const factV = dataDashboard.this_month_revenue || 0
    const planV = parseFloat((currentD.revenue_accumulated_planned + dataDashboard.reestr_sum / finance_planfact.length * currentDay).toFixed(0)) || 0
    const remainsDepositV = (finance_planfact.at(-1).revenue_accumulated_planned + dataDashboard.reestr_sum) || 0
    const sum = factV + planV + remainsDepositV

    fact.textContent = formattingPrice(factV)
    plan.textContent = formattingPrice(planV)
    remainsDeposit.textContent = formattingPrice(remainsDepositV)

    function findPercentageOfTotal(part, total) {
      return (part / total) * 100;
    }

    fact.style.width = `${findPercentageOfTotal(factV, sum)}%`
    plan.style.width = `${findPercentageOfTotal(planV, sum)}%`
    remainsDeposit.style.width = `${findPercentageOfTotal(remainsDepositV, sum)}%`

    if (planV < factV) {
      plan.style.color = "#19D06D"
      plan.style.background = 'rgba(206, 254, 228, 0.8)'
    }
  }

  onRender([dataDashboard, { finance_planfact = [] }], dataEntities) {
    this.renderWidgets(dataDashboard)
    this.actionsCharts(chart => chart.loader = this.loader)

    if (this.tables.length && dataEntities) {
      this.actionsTables((table, i) => table.onRendering(Array.isArray(dataEntities) ? dataEntities[i] : dataEntities))
    }

    // this.initRanges({ dataDashboard, finance_planfact, dataEntities })
    this.visualization({ dataDashboard, finance_planfact, dataEntities })
  }
}

export default Finance