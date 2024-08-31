import Table from '../Table.js';
import { createElement } from '../../../settings/createElement.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';

import { api } from '../../../settings/api.js';
import { inputValidator } from '../../../settings/validates.js';

function btnEditContent() {
  return `<svg class='icon icon-edit edit'>
            <use xlink:href='img/svg/sprite.svg#edit'></use>
          </svg>
          <svg class='icon icon-save save'>
            <use xlink:href='img/svg/sprite.svg#save'></use>
          </svg>`
}

class BaseTableForecast extends Table {
  constructor(selector, options, params) {
    super(selector, options, params)

    this.onReadyFunctions.push(function (context) {
      [this.select] = Array.from(context.selects.selects).filter(select => select.name === 'month_or_day')
      this.tableFooter = context.wpTable.querySelector('.ag-paging-panel')
      this.agPagingPageSize = context.wpTable.querySelector('.ag-paging-page-size')

      if (this.agPagingPageSize) {
        this.agPagingPageSize.remove()
      }

      this.btnAdd = context.wpTable.querySelector('.btn-table-add')
      this.wrapButtons = createElement('div', { classes: ['wrap-buttons'] })
      this.btnCancel = createElement('button', { classes: ['button', 'transparent'], content: `<span>Отменить<span>` })

      this.btnAdd.addEventListener('click', context.addEmptyRow.bind(this))
      this.btnCancel.addEventListener('click', context.handleClickBtnCancel.bind(this))

      this.wrapButtons.appendChild(this.btnCancel)
      this.tableFooter.appendChild(this.wrapButtons)
    }.bind(this))

    this.emptyRow = {};
    this.data = [];
    this.endpoint = params.endpoint || ''
    this.keysQueryParams = params.keysQueryParams || []
    this.gridOptions.columnDefs.forEach(coll => coll.field ? this.emptyRow[coll.field] = 0 : '');

    this.btnEditCellRenderer = this.btnEditCellRenderer.bind(this)
    this.validateInputHandler = this.validateInput.bind(this);
  }

  addHandleDbClickCell(params) {
    params.eGridCell.addEventListener('dblclick', e => {
      const row = params.eGridCell.closest('.ag-row')
      const input = e.target.closest('input')
      const btnEdit = row.querySelector('.button-table-row-edit')

      if (input.classList.contains('not-edit')) {
        btnEdit.classList.add('_edit');
        this.setReadonly(input, false)
      }
    })
  }

  btnEditCellRenderer(params) {
    const button = createElement('button', { classes: ['button-table-row-edit',], content: btnEditContent() });

    if (params.data.isNew) {
      this.toggleEditMode(params);
    }

    button.addEventListener('click', () => this.toggleEditMode(params));
    params.btnEdit = button

    return button;
  }

  toggleEditMode(params) {
    let { data } = params;
    const row = params.eGridCell.closest('.ag-row');
    const button = row.querySelector('.button-table-row-edit')
    const isEditMode = button.classList.toggle('_edit');
    const inputs = row.querySelectorAll('.cell-input');

    inputs.length && inputs.forEach(input => {
      this.setReadonly(input, !isEditMode);
      if (isEditMode) {
        input.addEventListener('input', this.validateInputHandler);
      } else {
        data[input.name] = input.name === 'data' ? input.dataset.value : +input.value;
        input.removeEventListener('input', this.validateInputHandler);
      }
    });

    if (!isEditMode) {
      if (data.isNew) {
        delete data.isNew;
        this.data = [...this.data, data];
      }
      const queryParams = { day: data.data, month_or_day: this.queryParams.month_or_day || 'day' }

      Object.keys(data).forEach(key => {
        if (this.keysQueryParams.includes(key)) {
          queryParams[key] = data[key]
        }
      })

      this.setPlan(queryParams, this.endpoint, params).then(data => {
        if (data.msg_type !== 'success') return
        const rowNode = this.gridApi.getRowNode(params.node.id);
        this.gridApi.refreshCells({
          rowNodes: [rowNode],
          force: true // опционально, заставит рендерить все ячейки, даже если данные не изменились
        });
      })
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
    let emptyRow = { ...this.emptyRow };
    emptyRow.data = dateFormatter(new Date(), this.select.value === 'day' ? 'yyyy-MM-dd' : 'yyyy-MM');
    emptyRow.isNew = true;
    this.gridApi.applyTransaction({ add: [emptyRow], addIndex: 0 });
  }

  handleClickBtnCancel() {
    this.gridApi.setGridOption('rowData', this.data);
  }

  async setPlan(data, endpoint) {
    try {
      this.loader.enable();
      const response = await api.post(endpoint, data);
      if (response.status !== 200) return;
      this.app.notify.show(response.data)
      return response.data
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      this.loader.disable();
    }
  }
}

export default BaseTableForecast