import Dashboards from "../Dashboards.js";
import TableUpcomingPayments from "../../../components/Tables/TableUpcomingPayments/TableUpcomingPayments.js"
// import ChartMonthlyRevenue from "../../../components/Charts/ChartMonthlyRevenue/ChartMonthlyRevenue.js";
// import ChartRegistrationFees from "../../../components/Charts/ChartRegistrationFees/ChartRegistrationFees.js";
// import ChartFeesNewCustomers from "../../../components/Charts/ChartFeesNewCustomers/ChartFeesNewCustomers.js";
import ChartRevenue from "../../../components/Charts/ChartRevenue/ChartRevenue.js";
import { getDashboardFinance, getFuturePayments, getFinancePlan, postFuturePayments } from "../../../settings/request.js";
import { formattingPrice } from "../../../utils/formattingPrice.js";
// import RangeSlider from "../../../components/RangeSlider/RangeSlider.js";
// import { formattingPrice } from "../../../utils/formattingPrice.js";

class Finance extends Dashboards {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-payments',
          TableComponent: TableUpcomingPayments,
          options: {
            paginationPageSize: 1000
          },
          params: {
            getData: postFuturePayments
          }
        }
      ],
      charts: [
        // { id: 'chart-registration-fees', ChartComponent: ChartRegistrationFees },
        // { id: 'chart-fees-new-customers', ChartComponent: ChartFeesNewCustomers },
        { id: 'chart-revenue', ChartComponent: ChartRevenue },
      ],
      page: 'dashboards/finance'
    });

    this.actionsCharts(chart => {
      chart.loader = this.loader
      chart.app = this.app
    })

    const inputCheckbox = this.wrapper.querySelector('[name="without-large-cells"]')
    inputCheckbox && inputCheckbox.addEventListener('change', this.handleChangeInput.bind(this))
  }

  async getData(queryParams = {}) {
    return postFuturePayments({ show_cnt: 1000, ...queryParams });
  }

  async getDashboardData(queryParams = {}) {
    return Promise.all([getDashboardFinance({ ...this.queryParams, ...queryParams }), getFinancePlan(queryParams)])
  }


  handleChangeInput({ target }) {
    const [inputStartArea, inputEndArea] = Array.from(this.inputsFilter).map(input => {
      if (['start_area', 'end_area'].includes(input.name)) {
        return input
      }
    })

    let attrName = 'data-old-value'

    let oldStartAreaV = inputStartArea.getAttribute(attrName) || inputStartArea.value
    let oldEndAreaV = inputEndArea.getAttribute(attrName) || inputEndArea.value

    if (target.checked) {
      inputStartArea.setAttribute(attrName, inputStartArea.value)
      inputEndArea.setAttribute(attrName, inputEndArea.value)

      inputStartArea.value = 0
      inputEndArea.value = 40
    } else {
      inputStartArea.value = oldStartAreaV
      inputEndArea.value = oldEndAreaV
    }

    this.changeQueryParams({ start_area: inputStartArea.value, end_area: inputEndArea.value })
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

  onHandleScrollTo({ params }) {
    const [table] = this.tables
    if (!params) return
    params = JSON.parse(params)
    table.selects.setValue(params.real_payment)
    table.changeQueryParams(params)
  }

  visualization({ dataDashboard, finance_planfact, dataEntities }) {
    const visualization = this.wrapper.querySelector('.visualization')
    const fact = this.wrapper.querySelector('.visualization-fact')
    // const plan = this.wrapper.querySelector('.visualization-plan')
    const remainsDeposit = this.wrapper.querySelector('.visualization-remains-deposit')
    const differenceFactPlan = this.wrapper.querySelector('.difference-fact-plan')
    const needsCollectedMont = this.wrapper.querySelector('.needs-collected-mont')

    const currentDay = new Date().getDate();
    const [currentD] = finance_planfact.filter(obj => new Date(obj.data).toDateString() == new Date().toDateString())
    const data = currentD ? currentD : finance_planfact.at(-1)

    const factV = data.revenue_reestr_accumulated || 0
    const planV = data.reest_plan_accumulated // parseFloat((currentD.revenue_accumulated_planned + dataDashboard.reestr_sum / finance_planfact.length * currentDay).toFixed(0)) || 0
    const needsCollectedMontV = dataDashboard.reestr_sum || 0
    const remainsDepositV = needsCollectedMontV - factV
    const differenceFactPlanV = planV - factV
    const sum = factV + remainsDepositV

    differenceFactPlan.textContent = formattingPrice(differenceFactPlanV)
    needsCollectedMont.textContent = formattingPrice(needsCollectedMontV)
    fact.textContent = formattingPrice(factV)
    // plan.textContent = formattingPrice(planV)
    remainsDeposit.textContent = formattingPrice(remainsDepositV)

    function findPercentageOfTotal(part, total) {
      return (part / total) * 100;
    }

    fact.style.width = `${findPercentageOfTotal(factV, sum)}%`
    // plan.style.width = `calc(${findPercentageOfTotal(planV, sum)}% + 15px)`
    remainsDeposit.style.width = `calc(${findPercentageOfTotal(remainsDepositV, sum)}% + 30px)`

    differenceFactPlan.style.left = `${findPercentageOfTotal(factV, sum) / 2}%`
    // plan.style.left = `${findPercentageOfTotal(factV, sum)}%`
    remainsDeposit.style.left = `${(findPercentageOfTotal(factV, sum))}%`

    if (planV < factV) {
      differenceFactPlan.classList.remove('text-error')
      differenceFactPlan.classList.add('text-success')
      // plan.style.color = "#19D06D"
      // plan.style.background = 'rgba(206, 254, 228, 1)'
      // visualization.querySelector('._circle plan').style.color = "#19D06D"
    }
  }

  onRender([dataDashboard, { finance_planfact = [] }], dataEntities) {
    this.renderWidgets(dataDashboard)

    if (this.tables.length && dataEntities) {
      this.actionsTables((table, i) => table.onRendering(Array.isArray(dataEntities) ? dataEntities[i] : dataEntities))
    }

    // this.initRanges({ dataDashboard, finance_planfact, dataEntities })
    this.visualization({ dataDashboard, finance_planfact, dataEntities })
  }
}

export default Finance