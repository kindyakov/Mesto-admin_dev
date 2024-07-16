import Dashboards from "../Dashboards.js";
import TablePayments from "../../../components/Tables/TablePayments/TablePayments.js"
import { getDashboardFinance, getPayments } from "../../../settings/request.js";
import { cellRendererInput } from "../../../components/Tables/utils/cellRenderer.js";
import { getFormattedDate } from "../../../utils/getFormattedDate.js";
import { formattingPrice } from "../../../utils/formattingPrice.js";
import { addPrefixToNumbers } from "../../../components/Tables/utils/addPrefixToNumbers.js";

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
                headerName: 'Дата платежа', field: 'payment_date', flex: 0.5,
                cellRenderer: params => cellRendererInput(params, getFormattedDate, 'calendar')
              },
              {
                headerName: 'Сумма', field: 'amount', flex: 0.5,
                cellRenderer: params => {
                  const span = document.createElement('span')
                  span.classList.add('table-span-price')
                  span.innerHTML = params.value ? formattingPrice(params.value) : 'нет'
                  return cellRendererInput(params, undefined, null, span)
                }
              },
              {
                headerName: 'ФИО', field: 'fullname', flex: 1,
                cellRenderer: params => cellRendererInput(params, undefined, 'profile')
              },
              {
                headerName: 'Договор', field: 'agrid', flex: 0.5,
                cellRenderer: params => {
                  const span = document.createElement('span')
                  span.classList.add('table-span-agrid')
                  span.textContent = params.value ? addPrefixToNumbers(params.value) : 'нет'
                  return cellRendererInput(params, undefined, null, span)
                }
              },
              {
                headerName: 'Вид поступления', field: 'type', flex: 0.5,
              },
              {
                headerName: 'Физ./Юр.', field: 'user_type', flex: 0.5, resizable: false,
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
      page: 'finance'
    });
  }

  async getData(data = {}) {
    return getPayments(data);
  }

  async getDashboardData(data = {}) {
    return getDashboardFinance(data);
  }
}

export default Finance