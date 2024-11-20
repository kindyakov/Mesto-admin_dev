import merge from "lodash.merge";
import mergeWith from "lodash.mergewith";
import { createElement } from "../../../settings/createElement.js";
import { determineType } from "../../../utils/determineType.js";

class CustomFilter {
  constructor() {
    this.checkboxes = []
    this.inputsRadio = []

    this.timer = null

    this.btnOk = createElement('button', { classes: ['button', 'table-button'], content: 'Ок' })
    this.btnCancel = createElement('button', { classes: ['button', 'table-button', 'transparent'], content: 'Отмена' })

    this.btnOk.addEventListener('click', e => this.handleClickBtnOk(e))
    this.btnCancel.addEventListener('click', e => this.handleClickBtnCancel(e))

    this.reqData = { filters: {} }
  }

  onOk() {

  }

  onChange() {

  }

  handleChangeRadio(e) {
    this.inputsRadio.length && this.inputsRadio.forEach(input => {
      if (e.target == input) return
      input.checked = false
    })
  }

  handleChangeCheckbox(e) {
    const input = e.target

    if (input.classList.contains('all')) {
      Object.values(this.checkboxes).forEach(checkbox => {
        checkbox.checked = input.checked
      })
    } else {
      let flag = true
      Object.values(this.checkboxes).forEach(checkbox => {
        if (!checkbox.checked && !checkbox.classList.contains('all')) {
          flag = false
        }
      })

      this.checkboxes.all.checked = flag
    }
  }

  handleClickBtnOk(e) {
    const form = e.target.closest('form')
    const formData = new FormData(form)
    let data = { enable_filter: 1, filters: {} }

    Array.from(formData).forEach(([key, value]) => {
      if (key.split('-').length == 2) {
        key = key.split('-')[1]

        if (!data.filters[key]) {
          data.filters[key] = []
        }

        value && data.filters[key].push(value)
      } else {
        data[key] = !isNaN(+value) ? +value : value
        data.sort_column = this.params.column.colDef.field
      }
    })

    this.reqData = mergeWith(this.reqData, data,
      (objValue, srcValue) => {
        if (Array.isArray(objValue)) {
          return srcValue; // Заменяем массив вместо объединения
        }
      }
    )

    this.closeFilter(this.params.column.colDef.field)

    this.onChange(this.reqData)
  }

  handleClickBtnCancel(e) {
    const form = e.target.closest('form')
    const key = this.params.column.colDef.field

    Array.from(form).forEach(el => {
      if (el.tagName === 'INPUT') {
        el.checked = false
        if (el.classList.contains('input-search')) {
          el.value = ''
        }
      }
    })

    if (this.reqData.filters) {
      delete this.reqData.filters?.[key]

      if (!Object.keys(this.reqData.filters).length) {
        delete this.reqData.filters
        delete this.reqData.enable_filter
      }
    }

    this.closeFilter(key)
    this.onChange(this.reqData)
  }

  handleInputSearch(e, params) {
    const { filterWrapper, currentData, data, fullCurrentData, column } = params
    const listValues = filterWrapper.querySelector('.col-data-list')
    const items = listValues.querySelectorAll('li')
    const searchStr = e.target.value.toLowerCase().trim()

    items.forEach(item => {
      const input = item.querySelector('input')
      const value = input.value.toLowerCase().trim()

      if (input.classList.contains('all')) return

      if (value.search(searchStr) !== -1) {
        item.classList.remove('_none')
        input.disabled = false
      } else {
        item.classList.add('_none')
        input.disabled = true
      }
    })
  }

  closeFilter(columnField) {
    // const filterInstance = gridOptions.api.getFilterInstance(columnField);
    this.gridApi.hidePopupMenu()
    // if (filterInstance) {
    //   gridOptions.api.hidePopup(); // Скрывает текущее всплывающее окно
    //   console.log(`Фильтр для колонки "${columnField}" закрыт`);
    // }
  }

  createCheckbox({ val, name, i = 0, checked = false }) {
    let input = createElement('input', {
      classes: ['input-checkbox'],
      attributes: [
        ['type', 'checkbox'],
        ['name', name],
        ['value', val],
        ['id', `filter-checkbox-${name}-${i}`],
      ]
    })

    if (checked) {
      input.checked = checked
    }

    return input
  }

  updateCheckboxId(input, newIndex) {
    if (!input || !input.id) {
      console.error('Передан некорректный элемент или отсутствует атрибут id');
      return;
    }

    const newId = input.id.replace(/-\d+$/, `-${newIndex}`);
    input.id = newId;
  }

  createRadio({ val, name }) {
    return createElement('input', {
      attributes: [
        ['type', 'radio'],
        ['name', 'sort_direction'],
        ['value', val],
        ['id', `filter-radio-${name}-${val}`]
      ]
    })
  }

  htmlColList({ currentData, name }) {
    return `
    <ul class="col-data-list">
      <li>
        <label class="wrapper-checkbox" data-i="0">
          <label class="label-checkbox" for="filter-checkbox-${name}-0">
            <svg class="icon">
              <use xlink:href="img/svg/sprite.svg#check-3"></use>
            </svg>
          </label>
          <p>Выделить все</p>
        </label>
      </li>
      ${currentData.map((val, i) =>
      `<li>
        <label class="wrapper-checkbox" data-i="${i + 1}">
          <label class="label-checkbox" for="filter-checkbox-${name}-${i + 1}">
            <svg class="icon">
              <use xlink:href="img/svg/sprite.svg#check-3"></use>
            </svg>
          </label>
          <p>${val}</p>
        </label>
      </li>
      `).join('')}
    </ul>`
  }

  htmlSort({ name, str }) {
    return `
    <label class="label-radio" for="filter-radio-${name}-asc">
      ${str.asc}
    </label>
    <label class="label-radio" for="filter-radio-${name}-desc">
      ${str.desc}
    </label>`
  }

  renderInputSearch(params) {
    const { filterWrapper, currentData, data, column } = params

    const defaultInput = filterWrapper.querySelector('.ag-filter-body')
    defaultInput?.classList.add('_none')

    if (filterWrapper.querySelector('.input-search')) return
    defaultInput.insertAdjacentHTML('afterend', `<div class="wp-input"></div>`)
    const wpInput = filterWrapper.querySelector('.wp-input')
    const input = createElement('input', {
      classes: ['input', 'input-search'],
      attributes: [
        ['type', 'text'],
        ['autocomplete', 'off'],
        ['placeholder', 'Поиск']
      ],
    })

    wpInput.appendChild(input)
    input.addEventListener('input', e => this.handleInputSearch(e, params))
  }

  renderSort(params) {
    const { filterWrapper, currentData, data, column } = params
    column.colDef.sort = column.colDef.sort || []
    let typeData = determineType(currentData[0]);

    const sortStr = {
      number: {
        asc: '↓ Сортировать по возрастанию',
        desc: '↑ Сортировать по убыванию'
      },
      string: {
        asc: '↓ Сортировать от А до Я',
        desc: '↑ Сортировать от Я до А'
      },
    }

    const wpSort = filterWrapper.querySelector('.wp-sort') ? filterWrapper.querySelector('.wp-sort') : createElement('div', {
      classes: ['wp-sort'],
      attributes: [['style', `display:flex;gap:5px;flex-direction: column;`]],
      content: this.htmlSort({ name: column.colDef.field, str: sortStr[typeData] })
    })

    !filterWrapper.querySelector('.wp-sort') && filterWrapper.appendChild(wpSort)

    if (!column.colDef.sort.length) {
      const values = Object.keys(sortStr[typeData])
      for (let i = 0; i < 2; i++) {
        const radio = this.createRadio({ val: values[i], name: column.colDef.field })
        column.colDef.sort.push(radio)
        radio.addEventListener('change', e => this.handleChangeRadio(e))
      }
      this.inputsRadio.push(...column.colDef.sort)
    }

    wpSort.querySelectorAll('.label-radio').forEach((el, i) => {
      el.insertAdjacentElement('beforebegin', column.colDef.sort[i])
    })
  }

  renderCheckbox(params) {
    const { filterWrapper, currentData, data, fullCurrentData, column } = params
    let customFilter = null, name = 'filter-' + column.colDef.field, key = column.colDef.field
    column.colDef.checkbox = column.colDef.checkbox || {}

    if (filterWrapper.querySelector('.custom-filter')) {
      customFilter = filterWrapper.querySelector('.custom-filter')
    } else {
      customFilter = createElement('div', { classes: ['custom-filter'] })
      filterWrapper.appendChild(customFilter)
    }

    customFilter.innerHTML = this.htmlColList({ currentData: fullCurrentData, name })

    if (!Object.keys(column.colDef.checkbox).length) {
      const checkboxAll = this.createCheckbox({ val: '', name }) // чекбокс который выделает все чекбоксы
      checkboxAll.classList.add('all')
      checkboxAll.addEventListener('change', e => this.handleChangeCheckbox(e))
      column.colDef.checkbox.all = checkboxAll

      fullCurrentData.forEach((val, i) => {
        let checked = currentData.includes(val)
        const checkbox = this.createCheckbox({ val, name, i: i + 1, checked })
        checkbox.addEventListener('change', e => this.handleChangeCheckbox(e))
        column.colDef.checkbox[val] = checkbox
      })
    }

    const labels = customFilter.querySelectorAll('.wrapper-checkbox')

    labels[0].insertAdjacentElement('afterbegin', column.colDef.checkbox.all)

    fullCurrentData.forEach((val, i) => {
      const index = labels[i + 1].dataset.i
      let checkbox = column.colDef.checkbox[val]

      if (!checkbox) {
        checkbox = this.createCheckbox({ val, name, i: index })
        checkbox.addEventListener('change', e => this.handleChangeCheckbox(e))
        column.colDef.checkbox[val] = checkbox
      } else {
        this.updateCheckboxId(checkbox, index)
      }

      labels[i + 1].insertAdjacentElement('afterbegin', column.colDef.checkbox[val])
    })

    this.checkboxes = column.colDef.checkbox
  }

  render(params) {
    const { filterWrapper } = params

    const wpButtons = filterWrapper.querySelector('.wp-buttons') ? filterWrapper.querySelector('.wp-buttons') : createElement('div', {
      classes: ['wp-buttons'],
      attributes: [['style', `display:flex;gap:5px;justify-content:flex-end;`]]
    })

    this.renderInputSearch(params)
    this.renderSort(params)
    this.renderCheckbox(params)

    wpButtons.appendChild(this.btnOk)
    wpButtons.appendChild(this.btnCancel)
    filterWrapper.appendChild(wpButtons)

    params.column.colDef.filterRenderer?.(params)

    this.params = merge(this.params, params)
  }
}

export default CustomFilter