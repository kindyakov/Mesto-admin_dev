import { createElement } from "../../../settings/createElement.js"

const defaultOptions = { funcFormate: val => val, iconId: null, el: null, inputmode: 'text', attributes: [] }

export function cellRendererInput(params, options = {}) {
  const { funcFormate, iconId, el, inputmode, attributes } = Object.assign({}, defaultOptions, options)
  const wpInput = createElement('div', ['wp-input', 'wp-input-cell', 'not-edit'])
  let attributesStr = ''

  if (el) {
    wpInput.classList.add('is-dop-content')
    el.classList.add('dop-el-content')
  }

  if (iconId) {
    const icon = `<svg class='icon icon-${iconId}'><use xlink:href='img/svg/sprite.svg#${iconId}'></use></svg>`
    wpInput.insertAdjacentHTML('afterbegin', icon)
    wpInput.classList.add('is-icon')
  }

  if (attributes.length) {
    attributesStr = attributes.map(attr => `${attr[0]}="${attr[1]}"`).join(' ')
  }

  wpInput.insertAdjacentHTML('beforeend', `<input type="text" name="${params.colDef.field}" value="${params.value ? funcFormate(params.value) : ''}" class="input-cell cell-input not-edit" autocomplete="off" readonly="true" inputmode="${inputmode}" ${attributesStr}>${el ? el.outerHTML : ''}`);
  return wpInput;
}