import merge from "lodash.merge";
import mergeWith from "lodash.mergewith";
import { createElement } from "../../../settings/createElement.js";
import { determineType } from "../../../utils/determineType.js";

class CustomFilter {
  constructor(gridApi) {
    this.gridApi = gridApi
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
      this.checkboxes.forEach(checkbox => {
        checkbox.checked = input.checked
      })
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
        data[key] = value
        data.sort_column = this.params.column.colDef.field
      }
    })

    this.reqData = mergeWith(this.reqData, data, this.params.queryParams,
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

  closeFilter(columnField) {
    // const filterInstance = gridOptions.api.getFilterInstance(columnField);
    this.gridApi.hidePopupMenu()
    // if (filterInstance) {
    //   gridOptions.api.hidePopup(); // Скрывает текущее всплывающее окно
    //   console.log(`Фильтр для колонки "${columnField}" закрыт`);
    // }
  }

  createCheckbox({ val, name, i }) {
    return createElement('input', {
      classes: ['input-checkbox'],
      attributes: [
        ['type', 'checkbox'],
        ['name', name],
        ['value', val],
        ['id', `filter-checkbox-${name}-${i}`]
      ]
    })
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
        <label class="wrapper-checkbox">
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
        <label class="wrapper-checkbox">
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
    const { filterWrapper, currentData, data, column } = params
    let customFilter = null, name = 'filter-' + column.colDef.field
    column.colDef.checkbox = column.colDef.checkbox || []

    if (filterWrapper.querySelector('.custom-filter')) {
      customFilter = filterWrapper.querySelector('.custom-filter')
    } else {
      customFilter = createElement('div', { classes: ['custom-filter'] })
      filterWrapper.appendChild(customFilter)
    }

    customFilter.innerHTML = this.htmlColList({ currentData, name })

    if (!column.colDef.checkbox.length) {
      const checkboxAll = this.createCheckbox({ val: '', name, i: 0 }) // чекбокс который выделает все чекбоксы
      checkboxAll.classList.add('all')
      checkboxAll.addEventListener('change', e => this.handleChangeCheckbox(e))
      column.colDef.checkbox.push(checkboxAll)

      currentData.map((val, i) => {
        const checkbox = this.createCheckbox({ val, name, i: i + 1 })
        checkbox.addEventListener('change', e => this.handleChangeCheckbox(e))
        column.colDef.checkbox.push(checkbox)
      })
    }

    customFilter.querySelectorAll('.wrapper-checkbox').forEach((el, i) => {
      el.insertAdjacentElement('afterbegin', column.colDef.checkbox[i])
    });

    this.checkboxes = column.colDef.checkbox
  }

  render(params) {
    const { filterWrapper, currentData, data, column } = params

    const wpButtons = filterWrapper.querySelector('.wp-buttons') ? filterWrapper.querySelector('.wp-buttons') : createElement('div', {
      classes: ['wp-buttons'],
      attributes: [['style', `display:flex;gap:5px;justify-content:flex-end;`]]
    })

    this.renderSort(params)
    this.renderCheckbox(params)

    wpButtons.appendChild(this.btnOk)
    wpButtons.appendChild(this.btnCancel)
    filterWrapper.appendChild(wpButtons)
    this.params = params

    params.column.colDef.filterRenderer?.(params)
  }
}

export default CustomFilter