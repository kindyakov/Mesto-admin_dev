import { createElement } from '../../../../settings/createElement.js';
import { api } from '../../../../settings/api.js';
import { outputInfo } from '../../../../utils/outputinfo.js';
import { Loader } from '../../../../modules/myLoader.js';
import { inputValidator } from '../../../../settings/validates.js';
import { formattingPrice } from '../../../../utils/formattingPrice.js';

class CustomHeaderComponentEdit {
  constructor() {
    this.params = null
    this.loader = null
  }

  init(params) {
    this.params = params
    this.eGui = createElement('button', { classes: ['btn-custom-th', 'btn-edit-th'], content: params.template });
    setTimeout(() => {
      this.wpTable = this.eGui.closest('.table')
      this.loader = new Loader(this.wpTable)
      this.wpTable.addEventListener('input', e => this.handleInput(e))
    });
    this.events()
  }

  getGui() {
    return this.eGui;
  }


  events() {
    this.eGui.addEventListener('click', this.handleClickBtnEdit.bind(this))
  }

  handleClickBtnEdit() {
    const rowsWithElements = this.getAllRowsWithElements(this.params.api, this.wpTable)
    const rowData = rowsWithElements.map(obj => obj.data)
    const rows = rowsWithElements.map(obj => obj.element)
    const isEditMode = this.eGui.classList.toggle('_edit')

    rowsWithElements.length && rowsWithElements.forEach(({ data, element }) => {
      const input = element.querySelector('input')
      const btnDel = element.querySelector('.btn-del')

      btnDel.classList.toggle('_show')
      this.setReadonly(input, !isEditMode)

      if (!isEditMode) {
        data[input.name] = input.value
      }
    })

    if (!isEditMode) {
      rowData.length && rowData.forEach(data => {
        if (!data.expenses) return
        const formData = new FormData()

        formData.set('sale_channel_id', data.channel_id)
        formData.set('month', data.month)
        formData.set('expense', data.expenses)

        this.setSaleChannelExpense(formData)
      })
    }
  }

  handleInput(e) {
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

  setReadonly(input, isReadonly) {
    if (isReadonly) {
      input.setAttribute('readonly', 'true');
      input.classList.add('not-edit');
      input.value = formattingPrice(+input.value)
    } else {
      input.removeAttribute('readonly');
      input.classList.remove('not-edit');
      this.handleInput(input)
    }
  }

  getAllRowsWithElements(gridApi, wpTable) {
    let rowsWithElements = [];
    const rowCount = gridApi.getDisplayedRowCount();

    for (let i = 0; i < rowCount; i++) {
      let rowNode = gridApi.getDisplayedRowAtIndex(i);
      let rowElement = wpTable.querySelector(`.ag-row[row-id="${rowNode.id}"]`);

      rowsWithElements.push({
        data: rowNode.data,
        element: rowElement
      });
    }

    return rowsWithElements;
  }

  async setSaleChannelExpense(formData) {
    try {
      this.loader.enable()
      const response = await api.post('/_set_sale_channel_expense_', formData)
      if (response.status !== 200) return null
      this.app.notify.show(response.data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      this.loader.disable()
    }
  }
}

export default CustomHeaderComponentEdit