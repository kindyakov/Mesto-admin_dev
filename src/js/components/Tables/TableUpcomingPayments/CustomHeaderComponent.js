import { createElement } from "../../../settings/createElement.js";

class CustomHeaderComponent {
  init(params) {
    this.params = params;
    this.params.valueFormatter = this.params.valueFormatter || function (value) {
      return value
    }

    this.eGui = createElement('div', {
      classes: ['custom-header']
    });
    this.iconAsc = createElement('span', {
      classes: ['ag-icon', 'ag-icon-asc']
    })
    this.iconDesc = createElement('span', {
      classes: ['ag-icon', 'ag-icon-desc']
    })
    this.eGui.innerHTML = `<span style="color: #4f5b67;font-size:12px;">${this.getHeaderName()}</span>`;
    this.eGui.appendChild(this.iconAsc)
    this.eGui.appendChild(this.iconDesc)
    this.eGui.addEventListener('click', (e) => this.handleSort(e));
  }

  getHeaderName() {
    let content = this.params.displayName
    const headersData = this.params.api.getGridOption('headersData')

    if (headersData) {
      content += ` <span class="text-info" style="font-size:12px;">${this.params.valueFormatter(headersData[this.params.headersDataKey])}</span>`
    }

    return content || 'Заголовок'; // пример с фиксированным заголовком
  }

  handleSort(e) {
    const currentSort = this.params.column.getSort();
    const newSort = currentSort === 'asc' ? 'desc' : currentSort === 'desc' ? null : 'asc';

    this.eGui.setAttribute('data-sort', newSort)
    this.params.setSort(newSort, true); // true для сортировки по одной колонке
  }

  getGui() {
    return this.eGui;
  }

  destroy() {
    this.eGui.removeEventListener('click', this.handleSort);
  }
}

export default CustomHeaderComponent