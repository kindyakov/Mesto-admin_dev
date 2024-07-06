import { createGrid } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { translations } from './translations.js';
import { paginationHtml } from './html.js';

class Table {
  constructor(selector, options, params) {
    let defaultParams = {
      isPagination: true,
      paginationCountBtn: 5,
      onPageChange: () => { },
    }

    let defaultoptions = {
      table: {},
      columnDefs: [],
      rowData: [],
      pagination: true,
      paginationPageSize: 5,
      paginationPageSizeSelector: [5, 10, 20, 31],
      getLocaleText: this.getLocaleText,
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
    }

    this.selector = selector
    this.params = Object.assign(defaultParams, params)
    this.gridOptions = Object.assign(defaultoptions, options)

    this.columnDefs = []
    this.grid = createGrid(document.querySelector(selector), this.gridOptions);
    this.table = document.querySelector(selector)

    this.onPageChange = this.params.onPageChange

    this.page = null
    this.pages = null
  }

  init() {
    if (!this.table) return
    this.events()
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
}

export default Table