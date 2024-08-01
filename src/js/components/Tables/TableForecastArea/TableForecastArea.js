import Table from '../Table.js';
import { createElement } from '../../../settings/createElement.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';

import { api } from '../../../settings/api.js';
import { inputValidator } from '../../../settings/validates.js';

import { formattingPrice } from '../../../utils/formattingPrice.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { outputInfo } from '../../../utils/outputinfo.js';

function btnEditContent() {
  return `<svg class='icon icon-edit edit'>
            <use xlink:href='img/svg/sprite.svg#edit'></use>
          </svg>
          <svg class='icon icon-save save'>
            <use xlink:href='img/svg/sprite.svg#save'></use>
          </svg>`
}

class TableForecastArea extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Период', field: 'data', minWidth: 80, flex: 0.5,
          valueFormatter: params => {
            if (!params.value) return '';
            // Определяем формат даты на основе наличия дня
            const hasDay = /^\d{4}-\d{2}-\d{2}$/.test(params.value);
            const format = hasDay ? "dd.MM.yyyy" : "yyyy, MMMM";

            return dateFormatter(params.value, format);
          }
        },
        {
          headerName: 'Выручка план', field: 'revenue_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => cellRendererInput(params, { funcFormate: formattingPrice, inputmode: 'numeric', })
        },
        {
          headerName: 'Выручка факт', field: 'revenue', minWidth: 80, flex: 0.5,
          valueFormatter: params => formattingPrice(params.value)
        },
        {
          headerName: '% выполнения', field: '', minWidth: 80, flex: 0.4,
          valueFormatter: params => {
            const { revenue, revenue_planned } = params.data
            return +revenue_planned ? +revenue / +revenue_planned * 100 + '%' : '—'
          }
        },
        {
          headerName: 'Выезды (м²) (план)', field: 'outflow_area', minWidth: 80, flex: 0.5,
          cellRenderer: params => cellRendererInput(params, { inputmode: 'decimal' })
        },
        {
          headerName: 'Выезды (м²) (факт)	% выполнения', field: 'outflow_area_planned', minWidth: 80, flex: 0.5,
        },
        {
          headerName: 'Заезды (м²) (план)', field: 'inflow_area_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => cellRendererInput(params, { inputmode: 'decimal' })
        },
        {
          headerName: 'Заезды (м²) (факт)', field: 'inflow_area', minWidth: 80, flex: 0.5,
        },
        {
          headerName: 'Выручка накопленным итогом (план)', field: 'revenue_accumulated_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => cellRendererInput(params, { funcFormate: formattingPrice, inputmode: 'numeric' })
        },
        {
          headerName: 'Выручка накопленным итогом (факт)', field: 'revenue_accumulated', minWidth: 80, flex: 0.5,
          valueFormatter: params => formattingPrice(params.value)
        },
        {
          headerName: 'Арендованная площадь (план)', field: 'rented_area_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => cellRendererInput(params, { funcFormate: formattingPrice, inputmode: 'decimal' })
        },
        {
          headerName: 'Арендованная площадь (факт)', field: 'rented_area', minWidth: 80, flex: 0.5,
        },
        {
          headerName: '% выполнения', field: '', minWidth: 80, flex: 0.6, resizable: false,
          valueFormatter: params => {
            const { rented_area, rented_area_planned } = params.data
            return +rented_area_planned ? +rented_area / +rented_area_planned * 100 + '%' : '—'
          }
        },
        {
          headerName: '', field: '', width: 50, resizable: false,
          cellRenderer: params => this.btnEditCellRenderer(params)
        }
      ],
      // pagination: false,
    };

    const defaultParams = {
      isPagination: false,
    }

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);
    super(selector, mergedOptions, mergedParams);

    this.emptyRow = {}
    this.data = []
    this.gridOptions.columnDefs.forEach(coll => coll.field ? this.emptyRow[coll.field] = 0 : '')

    this.btnEditCellRenderer = this.btnEditCellRenderer.bind(this)
    this.validateInputHandler = this.validateInput.bind(this);

    [this.select] = Array.from(this.selects.selects).filter(select => select.name === 'month_or_day')
    this.tableFooter = this.wpTable.querySelector('.ag-paging-panel')
    this.agPagingPageSize = this.wpTable.querySelector('.ag-paging-page-size')

    if (this.agPagingPageSize) {
      this.agPagingPageSize.remove()
    }

    this.btnAdd = this.wpTable.querySelector('.btn-table-add')
    this.wrapButtons = createElement('div', ['wrap-buttons'])
    this.btnCancel = createElement('button', ['button', 'transparent'], `<span>Отменить<span>`)

    this.btnAdd.addEventListener('click', this.addEmptyRow.bind(this))
    this.btnCancel.addEventListener('click', this.handleClickBtnCancel.bind(this))

    this.wrapButtons.appendChild(this.btnCancel)
    this.tableFooter.appendChild(this.wrapButtons)
  }

  render(data) {
    const [{ finance_planfact = [] }] = data;
    this.data = finance_planfact
    this.gridApi.setGridOption('rowData', finance_planfact)
    // this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, finance_planfact.length])
    this.gridApi.setGridOption('paginationPageSize', finance_planfact.length + 20)
  }

  btnEditCellRenderer(params) {
    const button = createElement('button', ['button-table-row-edit'], btnEditContent())

    if (params.data.isNew) {
      this.toggleEditMode(params, button)
    }

    button.addEventListener('click', () => this.toggleEditMode(params, button))
    return button
  }

  toggleEditMode(params, button) {
    let { data } = params
    const isEditMode = button.classList.toggle('_edit');
    const row = params.eGridCell.closest('.ag-row')
    const inputs = row.querySelectorAll('.cell-input')

    inputs.length && inputs.forEach(input => {
      this.setReadonly(input, !isEditMode);
      if (isEditMode) {
        input.addEventListener('input', this.validateInputHandler);
      } else {
        data[input.name] = +input.value
        input.removeEventListener('input', this.validateInputHandler);
      }
    });

    if (!isEditMode) {
      if (data.isNew) {
        delete data.isNew
        this.data = [...this.data, data]
      }

      this.setFinancePlan(data)
    }
  }

  setReadonly(input, isReadonly) {
    if (isReadonly) {
      input.setAttribute('readonly', 'true');
      input.classList.add('not-edit');
    } else {
      input.removeAttribute('readonly');
      input.classList.remove('not-edit');
    }
  }

  validateInput(e) {
    const input = e.target || e;
    const inputMode = input.getAttribute('inputmode');
    const validator = inputValidator[inputMode];
    const _input = validator ? validator(input) : input;

    if (_input.value) {
      _input.classList.remove('_err');
    } else {
      _input.classList.add('_err');
    }

    return !_input.classList.contains('_err');
  }

  addEmptyRow() {
    let emptyRow = { ...this.emptyRow }
    emptyRow.data = dateFormatter(new Date(), this.select.value === 'day' ? 'yyyy-MM-dd' : 'yyyy-MM')
    emptyRow.isNew = true

    this.gridApi.applyTransaction({ add: [emptyRow], addIndex: 0 }) // addIndex: 0 чтоб добавить в начало  
  }

  handleClickBtnCancel() {
    this.gridApi.setGridOption('rowData', this.data)
  }

  async setFinancePlan(data) {
    try {
      this.loader.enable()
      const response = await api.post('/_set_finance_plan_', data)
      if (response.status !== 200) return
      outputInfo(response.data)
    } catch (error) {
      console.log(error)
      throw error
    } finally {
      this.loader.disable()
    }
  }
}

export default TableForecastArea