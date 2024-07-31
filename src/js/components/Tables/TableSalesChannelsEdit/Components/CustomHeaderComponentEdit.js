import { createElement } from '../../../../settings/createElement.js';

class CustomHeaderComponentEdit {
  init(params) {
    this.eGui = createElement('button', ['btn-custom-th'], params.template);
  }

  getGui() {
    return this.eGui;
  }
}

export default CustomHeaderComponentEdit