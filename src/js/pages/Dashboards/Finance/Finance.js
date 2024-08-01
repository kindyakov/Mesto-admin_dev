import Dashboards from "../Dashboards.js";
import TablePayments from "../../../components/Tables/TablePayments/TablePayments.js"
import ChartMonthlyRevenue from "../../../components/Charts/ChartMonthlyRevenue/ChartMonthlyRevenue.js";
import { getDashboardFinance, getPayments, getFinancePlan } from "../../../settings/request.js";
import { cellRendererInput } from "../../../components/Tables/utils/cellRenderer.js";
import { getFormattedDate } from "../../../utils/getFormattedDate.js";
import { formattingPrice } from "../../../utils/formattingPrice.js";
import { addPrefixToNumbers } from "../../../components/Tables/utils/addPrefixToNumbers.js";
import { dateFormatter } from "../../../settings/dateFormatter.js";

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
          TableComponent: TablePayments,
          options: {
            columnDefs: [
              { headerCheckboxSelection: true, checkboxSelection: true, width: 50, resizable: false, sortable: false, },
              {
                headerName: 'Дата платежа', field: 'payment_date', minWidth: 140, flex: 0.5,
                cellRenderer: params => cellRendererInput(params, { funcFormate: getFormattedDate, iconId: 'calendar' })
              },
              {
                headerName: 'Сумма', field: 'amount', minWidth: 80, flex: 0.5,
                cellRenderer: params => {
                  const span = document.createElement('span')
                  span.classList.add('table-span-price')
                  span.innerHTML = params.value ? formattingPrice(params.value) : 'нет'
                  return cellRendererInput(params, { el: span })
                }
              },
              {
                headerName: 'ФИО', field: 'fullname', minWidth: 350, flex: 1,
                cellRenderer: params => cellRendererInput(params, { iconId: 'profile' })
              },
              {
                headerName: 'Договор', field: 'agrid', minWidth: 70, flex: 0.5,
                cellRenderer: params => {
                  const span = document.createElement('span')
                  span.classList.add('table-span-agrid')
                  span.textContent = params.value ? addPrefixToNumbers(params.value) : 'нет'
                  return cellRendererInput(params, { el: span })
                }
              },
              {
                headerName: 'Вид поступления', field: 'type', minWidth: 90, flex: 0.5,
              },
              {
                headerName: 'Физ./Юр.', field: 'user_type', minWidth: 90, flex: 0.5, resizable: false,
                valueFormatter: params => params.value === 'f' ? 'Физ. лицо' : 'Юр. лицо'
              },
              // {
              //   headerName: 'Действия', field: 'actions', flex: 0.3, resizable: false, sortable: false,
              //   cellRenderer: params => this.actionCellRenderer(params),
              // }
            ]
          }
        }
      ],
      charts: [
        { id: 'chart-monthly-revenue', ChartComponent: ChartMonthlyRevenue },
      ],
      page: 'finance'
    });
  }

  async getData(data = {}) {
    return getPayments(data);
  }

  async getDashboardData(data = {}) {
    return Promise.all([getDashboardFinance(data), getFinancePlan(Object.keys(data).length ? data : {
      start_date: dateFormatter(getFirstAndLastDayOfMonth()[0], 'yyyy-MM-dd'),
      end_date: dateFormatter(getFirstAndLastDayOfMonth()[1], 'yyyy-MM-dd')
    })])
  }

  async render() {
    try {
      this.loader.enable()
      const [dataDashboard, dataEntities,] = await Promise.all([this.getDashboardData(), this.getData()])

      if (dataDashboard) {
        const [dataWidgets = [], { finance_planfact = [] }] = dataDashboard
        this.renderWidgets(dataWidgets)
        this.actionsCharts(chart => chart.render(finance_planfact))
      }

      if (this.tables.length && dataEntities) {
        this.actionsTables(table => table.render(dataEntities))
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default Finance