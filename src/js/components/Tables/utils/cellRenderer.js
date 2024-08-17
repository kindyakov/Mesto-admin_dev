import tippy from "../../../configs/tippy.js"
import { exSelect } from "../../../modules/mySelect.js"
import { createElement } from "../../../settings/createElement.js"

const defaultOptionsInput = { funcFormate: val => val, iconId: null, el: null, inputmode: 'text', attributes: [] }

export function cellRendererInput(params, options = {}) {
  const { funcFormate, iconId, el, inputmode, attributes } = Object.assign({}, defaultOptionsInput, options)
  const wpInput = createElement('div', { classes: ['wp-input', 'wp-input-cell', 'not-edit'] })
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

const defaultOptionsSelect = { funcFormate: val => val, el: null, options: [], onSelect: () => { } }

export function cellRendererSelect(params, opts = {}) {
  const { funcFormate, el, options, onSelect } = Object.assign({}, defaultOptionsSelect, opts)

  function renderOptions(options) {
    return options.map(value => `<option value="${value}">${funcFormate(value)}</option>`).join('')
  }

  const select = createElement('select', {
    classes: ['init-custom-select'],
    attributes: [
      ['name', `${params.colDef.field}`],
      ['data-special-select', 'select-table-transactions']
    ],
    content: renderOptions(options)
  })

  const wpInput = createElement('div', { classes: ['wp-input', 'wp-input-cell', 'not-edit'], content: select })

  if (el) {
    wpInput.classList.add('is-dop-content')
    el.classList.add('dop-el-content')
    wpInput.appendChild(el)
  }

  params.eSelectCustom = new exSelect([select])

  const [mySelect] = params.eSelectCustom.selectsCustom
  const sInput = mySelect.querySelector('.mySelect__input')
  const sList = mySelect.querySelector('.mySelect__list')
  const copyList = createElement('ul', {
    classes: ['mySelect__list', '_canceling-styles'],
    content: sList.innerHTML
  })

  const tippyEx = tippy(sInput, {
    content: copyList.outerHTML,
    placement: 'bottom',
    offset: [0, 0],
    onCreate(instance) {
      const { popper, hide } = instance

      popper.addEventListener('click', e => {
        const option = e.target.closest('.mySelect__option')
        if (option) {
          params.value = option.dataset.value
          params.data[params.colDef.field] = params.value
          params.eSelectCustom.disableSelectedOption(popper, params.value)
          params.eSelectCustom.setValue(params.value)
          params.eSelectCustom.close()
          if (el) {
            el.innerText = params.value
          }
          hide()
          onSelect(params.value)
        }
      })

      instance.sList = popper.querySelector('.mySelect__list')
      instance.sOptions = popper.querySelectorAll('.mySelect__option')
    },
    onShow({ popper }) {
      const list = popper.querySelector('.mySelect__list')
      list.style.width = sInput.clientWidth + 'px'
    }
  })

  return wpInput
}