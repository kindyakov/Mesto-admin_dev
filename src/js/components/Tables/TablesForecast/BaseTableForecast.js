import Table from '../Table.js';
import { createElement } from '../../../settings/createElement.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';

import { api } from '../../../settings/api.js';
import { inputValidator } from '../../../settings/validates.js';

import { outputInfo } from '../../../utils/outputinfo.js';

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
    super(selector, options, params);

    this.emptyRow = {};
    this.data = [];
    this.endpoint = params.endpoint || ''
    this.gridOptions.columnDefs.forEach(coll => coll.field ? this.emptyRow[coll.field] = 0 : '');

    this.btnEditCellRenderer = this.btnEditCellRenderer.bind(this)
    this.validateInputHandler = this.validateInput.bind(this);

    [this.select] = Array.from(this.selects.selects).filter(select => select.name === 'month_or_day')
    this.tableFooter = this.wpTable.querySelector('.ag-paging-panel')
    this.agPagingPageSize = this.wpTable.querySelector('.ag-paging-page-size')

    if (this.agPagingPageSize) {
      this.agPagingPageSize.remove()
    }

    this.btnAdd = this.wpTable.querySelector('.btn-table-add')
    this.wrapButtons = createElement('div', { classes: ['wrap-buttons'] })
    this.btnCancel = createElement('button', { classes: ['button', 'transparent'], content: `<span>Отменить<span>` })

    this.btnAdd.addEventListener('click', this.addEmptyRow.bind(this))
    this.btnCancel.addEventListener('click', this.handleClickBtnCancel.bind(this))

    this.wrapButtons.appendChild(this.btnCancel)
    this.tableFooter.appendChild(this.wrapButtons)
  }

  btnEditCellRenderer(params) {
    const button = createElement('button', { classes: ['button-table-row-edit'], content: btnEditContent() });

    if (params.data.isNew) {
      this.toggleEditMode(params, button);
    }

    button.addEventListener('click', () => this.toggleEditMode(params, button));
    return button;
  }

  toggleEditMode(params, button) {
    let { data } = params;
    const isEditMode = button.classList.toggle('_edit');
    const row = params.eGridCell.closest('.ag-row');
    const inputs = row.querySelectorAll('.cell-input');

    inputs.length && inputs.forEach(input => {
      this.setReadonly(input, !isEditMode);
      if (isEditMode) {
        input.addEventListener('input', this.validateInputHandler);
      } else {
        data[input.name] = +input.value;
        input.removeEventListener('input', this.validateInputHandler);
      }
    });

    if (!isEditMode) {
      if (data.isNew) {
        delete data.isNew;
        this.data = [...this.data, data];
      }

      this.setPlan(data, this.endpoint);
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
      outputInfo(response.data);
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      this.loader.disable();
    }
  }
}

export default BaseTableForecast