import { createElement } from "../../../settings/createElement.js";

class CustomFilter {
  constructor(gridApi) {
    this.gridApi = gridApi
    this.checkboxes = []

    this.timer = null

    this.btnOk = createElement('button', { classes: ['button', 'table-button'], content: 'Ок' })
    this.btnCancel = createElement('button', { classes: ['button', 'table-button', 'transparent'], content: 'Отмена' })

    this.btnOk.addEventListener('click', e => this.handleClickBtnOk(e))
    this.btnCancel.addEventListener('click', e => this.handleClickBtnCancel(e))
    console.log(this.gridApi)

  }

  onOk() {

  }

  onChange() {

  }

  handleChange(e) {
    const input = e.target

    if (input.classList.contains('all')) {
      this.checkboxes.forEach(checkbox => {
        checkbox.checked = input.checked
      })
    }

    this.onChange({ value: input.value })
  }

  handleClickBtnOk(e) {
    const form = e.target.closest('form')
    const formData = new FormData(form)
    let data = {}

    Array.from(formData).forEach(([key, value]) => {
      if (!data[key]) {
        data[key] = []
      }

      value && data[key].push(value)
    })


    this.closeFilter(this.params.column.colDef.field)

    this.onOk(data)
  }

  handleClickBtnCancel(e) {

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

  render(params) {
    const { filterWrapper, currentData, data, column } = params
    let customFilter = null, name = column.colDef.field
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
      checkboxAll.addEventListener('change', e => this.handleChange(e))
      column.colDef.checkbox.push(checkboxAll)

      currentData.map((val, i) => {
        const checkbox = this.createCheckbox({ val, name, i: i + 1 })
        checkbox.addEventListener('change', e => this.handleChange(e))
        column.colDef.checkbox.push(checkbox)
      })
    }

    customFilter.querySelectorAll('.wrapper-checkbox').forEach((el, i) => {
      el.insertAdjacentElement('afterbegin', column.colDef.checkbox[i])
    });

    const wpButtons = createElement('div', { attributes: [['style', `display:flex;gap:5px;justify-content:flex-end;`]] })

    wpButtons.appendChild(this.btnOk)
    wpButtons.appendChild(this.btnCancel)
    filterWrapper.appendChild(wpButtons)
    this.checkboxes = column.colDef.checkbox
    this.params = params
  }
}

export default CustomFilter