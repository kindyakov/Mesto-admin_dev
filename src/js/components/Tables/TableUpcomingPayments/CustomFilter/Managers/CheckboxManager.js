import { createElement } from "../../../../../settings/createElement.js";

export class CheckboxManager {
  constructor() {
    this.selectedCheckboxes = [];
  }

  setContainer(container) {
    this.container = container;
  }

  handleEvent(event) {
    const target = event.target;
    if (target.type === 'checkbox') {
      this.toggleCheckbox(target);
    }
  }

  toggleCheckbox(checkbox) {
    let flag = true
    if (checkbox.classList.contains('all')) {
      this.checkboxes.forEach(input => {
        input.checked = checkbox.checked
      });
      return
    }

    if (checkbox.checked) {
      this.selectedCheckboxes.push(checkbox.value);
    } else {
      this.selectedCheckboxes = this.selectedCheckboxes.filter(
        (value) => value !== checkbox.value
      );
    }

    this.checkboxes.slice(1).forEach(input => {
      if (!input.checked) {
        flag = false
      }
    })

    this.checkboxes[0].checked = flag
  }

  htmlColList({ currentData, name, dataWithoutCurrentFilter }) {
    function html({ name, val, i, isAll = false, isChecked = true }) {
      return `
      <li>
        <label class="wrapper-checkbox" data-i="${i}">
          <input class="input-checkbox ${isAll ? 'all' : ''}" type="checkbox" name="${name}" value="${val == 'Выделить все' ? '' : val}" id="filter-checkbox-${name}-${i}" ${isChecked ? 'checked' : ''}>
          <label class="label-checkbox" for="filter-checkbox-${name}-${i}">
            <svg class="icon">
              <use xlink:href="img/svg/sprite.svg#check-3"></use>
            </svg>
          </label>
          <p>${val}</p>
        </label>
      </li>`
    }

    return `
    <ul class="col-data-list">
      ${html({ name, val: 'Выделить все', i: 0, isAll: true, isChecked: !dataWithoutCurrentFilter.length })}
      ${currentData.map((val, i) => html({ name, val, i: i + 1 })).join('')}
      ${dataWithoutCurrentFilter.length
      ? dataWithoutCurrentFilter.map((val, i) => html({ name, val, i: i + 1 + currentData.length, isChecked: false })).join('')
        : ''}
    </ul>`
  }

  render({ filterWrapper, currentData, data, fullCurrentData, column, dataWithoutCurrentFilter, ...params }) {
    this.customFilter?.remove()
    this.customFilter = createElement('div', {
      classes: ['custom-filter'],
      content: this.htmlColList({ currentData, dataWithoutCurrentFilter, name: 'filter-' + column.colDef.field })
    })

    this.checkboxes = Array.from(this.customFilter.querySelectorAll('input[type="checkbox"]'))

    filterWrapper.appendChild(this.customFilter)
  }
}