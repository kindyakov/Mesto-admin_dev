import { createGrid } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { translations } from './translations.js';
import { paginationHtml } from './html.js';
import { Loader } from '../../modules/myLoader.js';
import { Select, exSelect } from '../../modules/mySelect.js';
import { createCalendar } from '../../settings/createCalendar.js';

import { mergeQueryParams } from "../../utils/buildQueryParams.js";
import { createElement } from '../../settings/createElement.js';

class Table {
  constructor(selector, options, params) {
    let defaultParams = {
      isPagination: true,
      paginationCountBtn: 5,
      getData: async () => { },
      onPageChange: () => { },
      onSubmitSearch: () => { },
      onValidateSearch: () => { },
      onValueInputSearch: () => { },
      onInit: () => { },
    }

    let defaultoptions = {
      table: {},
      columnDefs: [],
      rowData: [],
      pagination: true,
      paginationPageSize: 5,
      paginationPageSizeSelector: [5, 10, 15, 20, 30],
      suppressRowClickSelection: true, // Отключение выбора строки при клике на ячейку
      suppressHorizontalScroll: false,
      // suppressPaginationPanel: true,
      suppressScrollOnNewData: true,
      // enableCellTextSelection: true, // разрешить выделять текст
      rowSelection: 'multiple', // Включение множественного выбора строк
      rowHeight: 60,
      domLayout: 'normal',
      getLocaleText: this.getLocaleText,
      onCellClicked: (params) => {
        if (params.column.colId === 'checkboxSelection') {
          params.node.setSelected(!params.node.isSelected());
        }
      },
      onGridReady: (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.tableFooter = document.querySelector(`${selector} .ag-paging-panel`)
        document.querySelector(`${selector} .ag-paging-row-summary-panel`)?.remove()
        document.querySelector(`${selector} .ag-paging-page-summary-panel`)?.remove()
        document.querySelector(`${selector} .ag-paging-page-size`)?.remove()

        if (defaultParams.isPagination) {
          this.tableFooter.insertAdjacentHTML('beforeend', paginationHtml.pagination())
          this.tablePaginationPages = this.tableFooter.querySelector(`.table-pagination-pages`)
          this.tablePaginationBtnPrev = this.tableFooter.querySelector(`.btn-pagination-prev`)
          this.tablePaginationBtnNext = this.tableFooter.querySelector(`.btn-pagination-next`)

          const pagingShowCount = createElement('div', {
            content: `<span>Показывать по</span>`,
            classes: ['paging-show-count'],
          })
          // Кастомный переключатель
          const select = createElement('select', {
            attributes: [
              ['name', 'count-rows'],
            ],
            content: `
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="0">все</option>
            `
          })

          pagingShowCount.appendChild(select)
          this.tableFooter.insertAdjacentElement('afterbegin', pagingShowCount)

          this.customPageSize = new exSelect([select], { selectMinWidth: 80, })
        }

        this.init()
      },
      onRowSelected: params => this.onRowSelected(params)
    }

    this.selector = selector
    this.params = Object.assign(defaultParams, params)
    this.gridOptions = Object.assign(defaultoptions, options)

    this.columnDefs = []
    this.grid = createGrid(this.gridOptions.wrapper.querySelector(selector), this.gridOptions);
    this.table = this.gridOptions.wrapper.querySelector(selector)
    this.app = window.app

    this.getData = this.params.getData
    this.onPageChange = this.params.onPageChange
    this.onSubmitSearch = this.params.onSubmitSearch
    this.onValidateSearch = this.params.onValidateSearch
    this.onValueInputSearch = this.params.onValueInputSearch
    this.onInit = this.params.onInit

    this.onRowSelected = this.onRowSelected.bind(this)

    this.selectedRows = []
    this.queryParams = { show_cnt: this.gridOptions.paginationPageSize }

    this.page = null
    this.pages = null

    // this.init()
  }

  init() {
    if (!this.table) return
    this.wpTable = this.table.closest('.table')
    this.formTableSearch = this.wpTable.querySelector('.form-table-search')
    this.inputTableSearch = this.wpTable.querySelector('.input-table-search')
    this.btnTableUploadExcel = this.wpTable.querySelector('.btn-table-upload-excel')

    this.loader = new Loader(this.wpTable)
    this.selects = this.selects || new Select({ uniqueName: 'select-filter-table', parentEl: this.wpTable })
    this.calendar = createCalendar(this.wpTable.querySelector('.input-date-filter'), {
      mode: "range",
      dateFormat: "d. M, Y",
    })

    this.events()
    this.onInit()
  }

  events() {
    this.table.addEventListener('click', e => {
      if (e.target.closest('.btn-pagination-prev') && this.params.isPagination) {
        this.prevPage()
      }

      if (e.target.closest('.btn-pagination-next') && this.params.isPagination) {
        this.nextPage()
      }

      if (e.target.closest('.btn-page') && this.params.isPagination) {
        this.handleBtnPage(e)
      }
    })

    if (this.btnTableUploadExcel) {
      this.btnTableUploadExcel.addEventListener('click', this.handleBtnUploadExcel.bind(this))
    }

    if (this.formTableSearch) {
      let timerSearch

      this.formTableSearch.addEventListener('submit', this.submitFormSearch.bind(this))

      this.inputTableSearch && this.inputTableSearch.addEventListener('input', e => {
        let value = e.target.value

        clearTimeout(timerSearch);
        timerSearch = setTimeout(() => {
          this.onValueInputSearch(value)
        }, 500);
      })
    }

    if (this.customPageSize) {
      this.customPageSize.setValue(this.gridOptions.paginationPageSize)
      this.customPageSize.onChange = (e, select, value) => {
        const count = value == 0 ? +this.cntAll : +value
        this.changeQueryParams({ show_cnt: count, page: value == 0 ? null : this.queryParams.page })
        this.gridApi.setGridOption('paginationPageSize', count)
      }
    }
  }

  getLocaleText(params) {
    return translations[params.key] || params.defaultValue;
  };

  setPage(page, pages) {
    this.page = page;
    this.pages = pages;
    this.updatePaginationControls(page, pages);
  }

  updatePaginationControls(currentPage, totalPages) {
    if (!this.tablePaginationPages) return;

    // Очистка текущей пагинации
    this.tablePaginationPages.innerHTML = '';

    const paginationArray = [];
    const paginationCountBtn = this.params.paginationCountBtn = 5;
    const halfBtnCount = Math.floor(paginationCountBtn / 1.1);

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - halfBtnCount && i <= currentPage + halfBtnCount)) {
        paginationArray.push(i);
      } else if (i === currentPage - halfBtnCount - 1 || i === currentPage + halfBtnCount + 1) {
        paginationArray.push('...');
      }
    }

    paginationArray.forEach(page => {
      this.tablePaginationPages.insertAdjacentHTML('beforeend', paginationHtml.li(page, page === currentPage));
    });
  }

  prevPage() {
    if (+this.page > 1) {
      this.page--;
      this.updatePaginationControls(this.page, this.pages);
      this.onPageChange(this.page);
    }
  }

  handleBtnPage(e) {
    const btn = e.target.closest('.btn-page')
    const page = btn.getAttribute('data-page');
    if (page === '...') return;
    if (parseInt(page, 10) !== this.page) {
      this.page = parseInt(page, 10)
      this.updatePaginationControls(this.page, this.pages)
      this.onPageChange(this.page);
    }
  }

  nextPage() {
    if (+this.page < this.pages) {
      this.page++;
      this.updatePaginationControls(this.page, this.pages);
      this.onPageChange(this.page);
    }
  }

  // срабатывает "submit" у form search
  submitFormSearch(e) {
    e.preventDefault()
    this.onValidateSearch(this.formTableSearch)
  }

  // Срабатывает при change у checkbox
  onRowSelected(currentData) {
    this.selectedRows = this.gridApi.getSelectedRows()
    this.btnTableUploadExcel.setAttribute('data-count', this.selectedRows.length ? `(${this.selectedRows.length})` : '')
    this.handleRowSelected(currentData, this.selectedRows)
  }

  // Обработчик клика по кнопке "Выгрузить в excel"
  handleBtnUploadExcel() {
    // if (this.selectedRows.length) {
    // ? Выполнить запрос на скачивание excel файла
    this.download(this.selectedRows)
    this.gridApi.deselectAll()
    // } else {
    // outputInfo({ msg: 'Выберите в таблице строчку', msg_type: 'warning' })
    // }
  }

  handleRowSelected() {

  }

  enableEditing(row) {
    if (!row) return []
    const els = row.querySelectorAll('.cell-input, .mySelect')

    els.length && els.forEach(el => {
      const wpInput = el.closest('.wp-input-cell')
      wpInput.classList.remove('not-edit')
      el.classList.remove('not-edit')
      el.removeAttribute('readonly')
    })

    return els
  }

  disableEditing(row) {
    if (!row) return
    const els = row.querySelectorAll('.cell-input, .mySelect')
    const btn = row.querySelector('.button-table-actions')

    els.length && els.forEach(el => {
      const wpInput = el.closest('.wp-input-cell')
      wpInput.classList.add('not-edit')
      el.classList.add('not-edit')
      el.setAttribute('readonly', true)
    })

    btn.classList.remove('_edit')
  }

  changeQueryParams(params) {
    this.queryParams = mergeQueryParams(this.queryParams, params)
    this.tableRendering(this.queryParams)
  }

  getAllRows() {
    let rowData = [];
    const rowCount = this.gridApi.getDisplayedRowCount();

    for (let i = 0; i < rowCount; i++) {
      let rowNode = this.gridApi.getDisplayedRowAtIndex(i);
      rowData.push(rowNode.data);
    }

    return rowData;
  }

  getAllRowsWithElements() {
    let rowsWithElements = [];
    const rowCount = this.gridApi.getDisplayedRowCount();

    for (let i = 0; i < rowCount; i++) {
      let rowNode = this.gridApi.getDisplayedRowAtIndex(i);
      let rowElement = this.wpTable.querySelector(`.ag - row[row - id="${rowNode.id}"]`);

      rowsWithElements.push({
        data: rowNode.data,
        element: rowElement
      });
    }

    return rowsWithElements;
  }

  onRendering(data) {
    console.log(data)
  }

  async tableRendering(queryParams = {}) {
    try {
      this.loader.enable()
      const data = await this.getData(queryParams)

      this.onRendering(data)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default Table