import Table from '../Table.js';
import tippy from '../../../configs/tippy.js';
import { actions } from '../utils/actions.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { addPrefixToNumbers } from '../utils/addPrefixToNumbers.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { getFormattedDate } from '../../../utils/getFormattedDate.js';
import { downloadAgreement } from '../../../settings/request.js';
import { createElement } from '../../../settings/createElement.js';

class TableAgreements extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        { headerCheckboxSelection: true, checkboxSelection: true, width: 50, resizable: false, sortable: false, },
        {
          headerName: 'Договор', field: 'agrid', minWidth: 80, flex: 0.3,
          cellRenderer: params => {
            const span = document.createElement('span')
            span.classList.add('table-span-agrid')
            span.textContent = params.value ? addPrefixToNumbers(params.value) : 'нет'
            return cellRendererInput(params, { el: span })
          }
        },
        {
          headerName: 'ФИО', field: 'fullname', minWidth: 300, flex: 1,
          cellRenderer: params => cellRendererInput(params, { iconId: 'profile' })
        },
        {
          headerName: 'Дата начала', field: 'agrbegdate', minWidth: 130, flex: 0.6,
          cellRenderer: params => cellRendererInput(params, { funcFormate: getFormattedDate, iconId: 'calendar' })
        },
        {
          headerName: 'Платеж в мес.', field: 'price', minWidth: 100, flex: 0.5,
          cellRenderer: params => {
            const span = createElement('span', { classes: ['table-span-price'] })
            span.innerHTML = params.value ? formattingPrice(params.value) : 'нет'
            return cellRendererInput(params, { el: span })
          }
        },
        {
          headerName: 'Ячейки', field: 'room_ids', minWidth: 90, flex: 0.5,
          cellRenderer: params => {
            const span = createElement('span', { classes: ['span-rooms-id'], content: `нет` })
            if (params.value) {
              span.innerHTML = addPrefixToNumbers(params.value)
              if (params.value.length > 1) {
                tippy(span, {
                  trigger: 'mouseenter',
                  placement: 'top',
                  arrow: true,
                  content: `<span class="tippy-info-span tippy-info-rooms-id" style="font-size: 14px;">${addPrefixToNumbers(params.value)}</span>`,
                })
              }
            }
            return span
          }
        },
        {
          headerName: 'Конец договора', field: 'agrplanenddate', minWidth: 100, flex: 0.5,
          valueFormatter: params => params.value ? getFormattedDate(params.value) : 'нет'
        },
        {
          headerName: 'Способ оплаты', field: 'last_payment_type', minWidth: 100, flex: 0.5,
        },
        {
          headerName: 'Действия', field: 'actions', width: 90,
          cellRenderer: params => this.actionCellRenderer(params), resizable: false, sortable: false
        }
      ],
    };

    const defaultParams = {
      selectTypeUser: true,
      onChangeTypeUser: () => { },
    }

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);

    super(selector, mergedOptions, mergedParams);

    this.actionCellRenderer = this.actionCellRenderer.bind(this)
    this.enableEditing = this.enableEditing.bind(this)

    this.onChangeTypeUser = this.params.onChangeTypeUser
  }

  actionCellRenderer(params) {
    const { user_id, user_type } = params.data
    const row = params.eGridCell.closest('.ag-row')
    const button = createElement('button', {
      classes: ['button-table-actions'], content: `<span></span><span></span><span></span><svg class='icon icon-check'><use xlink:href='img/svg/sprite.svg#check'></use></svg>`
    });
    let form

    const tippyInstance = actions(button, {
      buttonsIs: [true, false],
      attrModal: 'modal-agreement',
      data: params.data,
      onOpen: () => { },
    })

    return button
  }

  onRendering({ agreements = [], cnt_pages, page }) {
    this.setPage(page, cnt_pages)
    this.gridApi.setGridOption('rowData', agreements)
    this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, agreements.length])
  }

  async download(data) {
    try {
      this.loader.enable()
      let reqData = {}

      if (data.length) {
        const agrIds = data.map(obj => obj.agrid)
        reqData.all_agrs = 0
        reqData.agrids = agrIds
      } else {
        reqData.all_agrs = 1
      }

      const res = await downloadAgreement(reqData)
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      this.loader.disable()
    }
  }
}

export default TableAgreements
