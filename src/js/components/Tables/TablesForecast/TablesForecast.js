import Table from '../Table.js';
import { createElement } from '../../../settings/createElement.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';

import { api } from '../../../settings/api.js';
import { inputValidator } from '../../../settings/validates.js';
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

class TablesForecast extends Table {
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
          headerName: 'Количество лидов (план)', field: 'leads_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => cellRendererInput(params, { inputmode: 'numeric' })
        },
        {
          headerName: 'Количество лидов (факт)', field: 'leads_fact', minWidth: 80, flex: 0.6,
        },
        {
          headerName: '% выполнения', field: '', minWidth: 80, flex: 0.4,
        },
        {
          headerName: 'Количество лидов нарастающим итогом (план)', field: 'leads_accumulated_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => cellRendererInput(params, { inputmode: 'numeric' })
        },
        {
          headerName: 'Количество лидов нарастающим итогом (факт)', field: 'leads_accumulated_fact', minWidth: 80, flex: 0.5,
          // valueFormatter: params => params.value ? getFormattedDate(params.value) : 'нет'
        },
        {
          headerName: '% выполнения', field: '', minWidth: 80, flex: 0.5,
          valueFormatter: params => {
            const { leads_accumulated_fact, leads_accumulated_planned } = params.data
            return +leads_accumulated_planned ? +leads_accumulated_fact / +leads_accumulated_planned * 100 + '%' : '—'
          }
        },
        {
          headerName: 'Сделок (план)', field: 'sales_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => cellRendererInput(params, { inputmode: 'numeric' })
        },
        {
          headerName: 'Сделок (факт)', field: 'sales', minWidth: 80, flex: 0.5,
        },
        {
          headerName: '% выполнения', field: '', minWidth: 80, flex: 0.4, resizable: false,
          valueFormatter: params => {
            const { sales, sales_planned } = params.data
            return +sales_planned ? +sales / +sales_planned * 100 + '%' : '—'
          }
        },
        {
          headerName: '', field: '', width: 50, resizable: false,
          cellRenderer: params => this.btnEditCellRenderer(params)
        }
      ],
    };

    const defaultParams = {
      isPagination: false,
    }

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);
    super(selector, mergedOptions, mergedParams);

    this.emptyRow = {}
    this.gridOptions.columnDefs.forEach(coll => coll.field ? this.emptyRow[coll.field] = 0 : '')

    this.data = []
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
    const [a, { sales_planfact }] = data;
    this.data = sales_planfact
    this.gridApi.setGridOption('rowData', sales_planfact)
    // this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, sales_planfact.length])
    this.gridApi.setGridOption('paginationPageSize', sales_planfact.length + 20)
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

      this.setSalesPlan(data)
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

  async setSalesPlan(data) {
    try {
      this.loader.enable()
      const response = await api.post('/_set_sales_plan_', data)
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

export default TablesForecast