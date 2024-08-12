import tippy from '../../../../configs/tippy.js';
import { contentHtml } from './html.js';
import { createElement } from '../../../../settings/createElement.js';

class CustomHeaderComponentAddSales {
  constructor() {
    this.input = null
    this.btnAdd = null

    this.optionsTippy = {
      maxWidth: 300,
      placement: 'bottom-end',
      content: (reference) => {
        const content = createElement('div', [], contentHtml())
        this.input = content.querySelector('.input')
        this.btnAdd = content.querySelector('.btn-add')
        return content
      },
    }
  }

  init(params) {
    console.log(params);
    this.eGui = createElement('button', ['btn-custom-th'], params.template);
    this.tippy = tippy(this.eGui, this.optionsTippy)
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

  }

  handleClickBtnAdd() {
    this.tippy.hide()
  }
}

export default CustomHeaderComponentAddSales