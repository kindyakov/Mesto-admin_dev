import tippy from '../../../../configs/tippy.js';
import { contentHtml } from './html.js';
import { createElement } from '../../../../settings/createElement.js';
import { api } from '../../../../settings/api.js';
import { Loader } from '../../../../modules/myLoader.js';

class CustomHeaderComponentAddSales {
  constructor() {
    this.input = null
    this.value = null
    this.btnAdd = null
    this.params = null
    this.loader = null

    this.optionsTippy = {
      maxWidth: 300,
      placement: 'bottom-end',
      content: (reference) => {
        const content = createElement('div', { content: contentHtml() })
        this.input = content.querySelector('.input')
        this.btnAdd = content.querySelector('.btn-add')
        return content
      },
      onHidden() {
        this.value = null
      }
    }
  }

  init(params) {
    this.params = params
    this.eGui = createElement('button', { classes: ['btn-custom-th'], content: params.template });
    this.tippy = tippy(this.eGui, this.optionsTippy)
    setTimeout(() => {
      this.loader = new Loader(this.eGui.closest('.table'))
    });
    this.events()
  }

  events() {
    this.input.addEventListener('input', this.handleInput.bind(this))
    this.btnAdd.addEventListener('click', this.handleClickBtnAdd.bind(this))
  }

  getGui() {
    return this.eGui;
  }

  handleInput(e) {
    this.value = e.target.value
  }

  handleClickBtnAdd() {
    if (!this.value) return
    const rowCount = this.params.api.getDisplayedRowCount()
    const rowNode = this.params.api.getDisplayedRowAtIndex(0)
    const emptyRow = { month: null, ...rowNode?.data, channel_id: rowCount + 1, sale_channel_name: this.value, expenses: null }

    const formData = new FormData()
    formData.set('sale_channel_name', this.value)

    this.addSaleChannel(formData).then(({ msg_type }) => {
      if (msg_type === 'success') {
        this.params.api.applyTransaction({ add: [emptyRow] });
      }
    })

    this.tippy.hide()
  }

  async addSaleChannel(formData) {
    try {
      this.loader.enable()
      const response = await api.post('/_add_sale_channel_', formData)
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

export default CustomHeaderComponentAddSales