import Table from "../Table.js";
// import CustomHeaderComponent from "./CustomHeaderComponent.js";

import { addPrefixToNumbers } from '../utils/addPrefixToNumbers.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { observeCell } from "../utils/observeCell.js";

import { formattingPrice } from '../../../utils/formattingPrice.js';
import { getFormattedDate } from "../../../utils/getFormattedDate.js";
import { downloadFuturePayments } from "../../../settings/request.js";
import { createElement } from "../../../settings/createElement.js";

class TableUpcomingPayments extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        { headerCheckboxSelection: true, checkboxSelection: true, width: 50, resizable: false, sortable: false, filter: false },
        {
          headerName: 'Дата платежа', field: 'write_off_date', minWidth: 140, flex: 0.2,
          cellRenderer: params => cellRendererInput(params, { funcFormate: getFormattedDate, iconId: 'calendar' }),
          filterRenderer: e => {
       
          }
        },
        {
          headerName: 'Сумма', field: 'price', minWidth: 180, flex: 0.5,
          cellRenderer: params => {
            const span = createElement('span', {
              classes: ['table-span-price'],
              content: params.value ? formattingPrice(params.value) : 'нет',
            })

            if (!params.data.real_payment) {
              span.classList.add(new Date(params.data.write_off_date) >= new Date() ? 'warning' : 'error')
            }

            return cellRendererInput(params, { el: span })
          },
          // headerComponent: CustomHeaderComponent,
          // headerComponentParams: {
          //   headersDataKey: 'sum_amount',
          //   valueFormatter: value => formattingPrice(value)
          // },
        },
        {
          headerName: 'ФИО', field: 'fullname', minWidth: 300, flex: 1,
          cellRenderer: params => {
            const wp = cellRendererInput(params, { iconId: 'profile' })
            observeCell(wp, params)
            return wp
          },
        },
        {
          headerName: 'Договор', field: 'agrid', minWidth: 90, flex: 0.5,
          cellRenderer: params => {
            const span = createElement('span', {
              classes: ['table-span-agrid'],
              content: params.value ? addPrefixToNumbers(params.value) : 'нет',
            })
            return cellRendererInput(params, { el: span })
          }
        },
        {
          headerName: 'Площадь', field: 'area', minWidth: 180, flex: 0.3,
          valueFormatter: params => `${params.value} м²`,
        },
        {
          headerName: 'Средняя ставка', field: 'price_1m', minWidth: 200, flex: 0.5,
          cellRenderer: params => {
            const span = createElement('span', {
              classes: ['table-span-price'],
              content: params.value ? formattingPrice(params.value) : 'нет',
            })
            return cellRendererInput(params, { el: span })
          },
        },
        {
          headerName: 'Физ./Юр.', field: 'user_type', minWidth: 90, flex: 0.5,
          valueFormatter: params => params.value === 'f' ? 'Физ. лицо' : 'Юр. лицо'
        },
        {
          headerName: 'Депозит', field: 'deposit', minWidth: 150, flex: 0.5,
          cellRenderer: params => {
            const span = createElement('span', {
              classes: ['table-span-price'],
              content: params.value ? formattingPrice(params.value) : '',
            })
            return cellRendererInput(params, { el: span })
          },
        },
        {
          headerName: 'Осталось дней', field: 'days_left', minWidth: 90, flex: 0.5,
        }
      ],
      suppressColumnVirtualisation: true,
      onFilterOpened: (e) => {
        console.log(e, e.column.colDef.field)
        const filterWrapper = e.eGui.querySelector('.ag-filter-body-wrapper')

        e.column.colDef.filterRenderer?.(e)
      }, // сработает при открытие окна с фильтром
      onFilterChanged: (e) => {
        console.log(e,'Фильтр закрыт или изменен');
      }, // Фильтр закрыт или изменен
      defaultColDef: {
        filter: "agTextColumnFilter",
        // floatingFilter: true, // Добавляет панельку под заголовком
      },
    };

    const defaultParams = {}

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);
    super(selector, mergedOptions, mergedParams);
  }

  renderTextHeader(data) {
    const headersTable = this.table.querySelectorAll('.ag-header-cell')

    const func = (th, callback) => {
      const label = th.querySelector('.ag-header-cell-label')

      if (label.querySelector('.text-info')) return
      const spanText = th.querySelector('.ag-header-cell-text')
      let hName = spanText.innerText
      spanText.remove()

      const header = createElement('div', {
        classes: ['ag-header-cell-text', 'custom-header'],
        content: `${hName} <span class="text-info" style="font-size:12px;">${callback()}</span>`
      })

      label.prepend(header)
    }

    const obj = {
      2: th => func(th, () => formattingPrice(data.sum_amount)),
      3: th => func(th, () => data.cnt),
      5: th => func(th, () => data.sum_area + ' м²'),
      6: th => func(th, () => formattingPrice(data.avg_price)),
      8: th => func(th, () => formattingPrice(data.sum_deposit)),
    }

    headersTable.length && headersTable.forEach((th, i) => {
      obj[i]?.(th)
    })

  }

  onRendering({ agreements = [], cnt_pages, page, cnt_all = 0, ...data }) {
    this.cntAll = cnt_all
    this.pagination.setPage(page, cnt_pages, cnt_all)
    this.gridApi.setGridOption('headersData', data)
    this.gridApi.setGridOption('rowData', agreements)
    this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, agreements.length])
    this.renderTextHeader(data)
  }

  async download(data, isAll) {
    try {
      this.loader.enable()
      let reqData = {}

      if (isAll) {
        reqData.all_payments = 1
      } else {
        const writeIds = data.map(obj => obj.write_off_id)
        reqData.all_payments = 0
        reqData.write_off_ids = writeIds
      }

      const res = await downloadFuturePayments(reqData)
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      this.loader.disable()
    }
  }
}

export default TableUpcomingPayments