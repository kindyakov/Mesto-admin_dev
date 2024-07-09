import { createGrid, gridOptions } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { translations } from './translations.js';
import { paginationHtml } from './html.js';
import { outputInfo } from '../../utils/outputinfo.js';
import { Loader } from '../../modules/myLoader.js';

class Table {
  constructor(selector, options, params) {
    let defaultParams = {
      isPagination: true,
      paginationCountBtn: 5,
      onPageChange: () => { },
      onSubmitSearch: () => { },
      onValidateSearch: () => { },
      onValueInputSearch: () => { },
    }

    let defaultoptions = {
      table: {},
      columnDefs: [],
      rowData: [],
      pagination: true,
      paginationPageSize: 5,
      paginationPageSizeSelector: [5, 10, 20],
      getLocaleText: this.getLocaleText,
      suppressRowClickSelection: true, // Отключение выбора строки при клике на ячейку
      rowSelection: 'multiple', // Включение множественного выбора строк
      onCellClicked: (params) => {
        if (params.column.colId === 'checkboxSelection') {
          params.node.setSelected(!params.node.isSelected());
        }
      },
      rowHeight: 60,
      domLayout: 'normal',
      onGridReady: (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.tableFooter = document.querySelector(`${selector} .ag-paging-panel`)
        document.querySelector(`${selector} .ag-paging-row-summary-panel`).remove()
        document.querySelector(`${selector} .ag-paging-page-summary-panel`).remove()

        if (defaultParams.isPagination) {
          this.tableFooter.insertAdjacentHTML('beforeend', paginationHtml.pagination())
          this.tablePaginationPages = this.tableFooter.querySelector(`.table-pagination-pages`)
          this.tablePaginationBtnPrev = this.tableFooter.querySelector(`.btn-pagination-prev`)
          this.tablePaginationBtnNext = this.tableFooter.querySelector(`.btn-pagination-next`)
        }

        this.init()
      },
      onRowSelected: params => this.onRowSelected(params)
    }

    this.selector = selector
    this.params = Object.assign(defaultParams, params)
    this.gridOptions = Object.assign(defaultoptions, options)

    this.columnDefs = []
    this.grid = createGrid(document.querySelector(selector), this.gridOptions);
    this.table = document.querySelector(selector)

    this.onPageChange = this.params.onPageChange
    this.onSubmitSearch = this.params.onSubmitSearch
    this.onValidateSearch = this.params.onValidateSearch
    this.onValueInputSearch = this.params.onValueInputSearch

    this.onRowSelected = this.onRowSelected.bind(this)

    this.selectedRows = []

    this.page = null
    this.pages = null

    this.init()
    this.events()

  }

  init() {
    if (!this.table) return
    this.wpTable = this.table.closest('.table')
    this.formTableSearch = this.wpTable.querySelector('.form-table-search')
    this.inputTableSearch = this.wpTable.querySelector('.input-table-search')
    this.btnTableUploadExcel = this.wpTable.querySelector('.btn-table-upload-excel')

    this.loader = new Loader(this.wpTable)
  }

  events() {
    if (!this.table) return

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

    this.btnTableUploadExcel.addEventListener('click', this.handleBtnUploadExcel.bind(this))

    if (this.formTableSearch) {
      let timerSearch

      this.formTableSearch.addEventListener('submit', this.submitFormSearch.bind(this))

      this.inputTableSearch.addEventListener('input', e => {
        let value = e.target.value

        clearTimeout(timerSearch);
        timerSearch = setTimeout(() => {
          this.onValueInputSearch(value)
        }, 500);
      })
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
  onRowSelected(params) {
    this.selectedRows = this.gridApi.getSelectedRows();
    this.btnTableUploadExcel.setAttribute('data-count', this.selectedRows.length ? `(${this.selectedRows.length})` : '')
  }

  // Обработчик клика по кнопке "Выгрузить в excel"
  handleBtnUploadExcel() {
    if (this.selectedRows.length) {
      // ? Выполнить запрос на скачивание excel файла
    } else {
      outputInfo({ msg: 'Выберите в таблице строчку', msg_type: 'warning' })
    }
  }

  enableEditing(row) {
    if (!row) return []
    const inputs = row.querySelectorAll('.cell-input')

    inputs.length && inputs.forEach(input => {
      const wpInput = input.closest('.wp-input-cell')
      wpInput.classList.remove('not-edit')
      input.classList.remove('not-edit')
      input.removeAttribute('readonly')
    })

    return inputs
  }

  disableEditing(row) {
    if (!row) return
    const inputs = row.querySelectorAll('.cell-input')
    const btn = row.querySelector('.button-table-actions')

    inputs.length && inputs.forEach(input => {
      const wpInput = input.closest('.wp-input-cell')
      wpInput.classList.add('not-edit')
      input.classList.add('not-edit')
      input.setAttribute('readonly', true)
    })

    btn.classList.remove('_edit')
  }
}

export default Table