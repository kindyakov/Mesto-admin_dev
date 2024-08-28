import Page from "../Page.js"
import TableLocks from "../../components/Tables/TableLocks/TableLocks.js";
import Pagination from "../../components/Pagination/Pagination.js";
import { mergeQueryParams } from "../../utils/buildQueryParams.js";
// import FilterLocks from "../../components/Filters/FilterLocks/FilterLocks.js";

import { getLocksPower } from "../../settings/request.js";
import { Select } from "../../modules/mySelect.js";
import { cardHtml } from "./html.js";

function extractNumbers(str) {
  const nonDigitRegex = /\D/g;
  return str.replace(nonDigitRegex, '');
}

class ChargingLocks extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-locks',
          TableComponent: TableLocks,
          options: {
            paginationPageSize: 15
          },
          params: {
            getData: getLocksPower
          }
        }
      ],
      page: 'charging-locks'
    });

    this.tableLocks = this.tables[0]
    this.customSelect = new Select({ uniqueName: 'select-change-display' })
    this.pagination = new Pagination(this.wrapper.querySelector('.locks__footer'), { pageSize: this.tables[0].gridOptions.paginationPageSize })
    // this.filterLocks = new FilterLocks(this.wrapper.querySelector('.btn-set-filters'))
    this.locks = this.wrapper.querySelector('.locks')
    this.locksContent = this.wrapper.querySelector('.locks__content')

    this.inputSearch = this.wrapper.querySelector('.input-search')
    this.btnSort = this.wrapper.querySelector('.btn-set-sort')

    this.customSelect.onChange = (e, select, value) => {
      if (value === 'tile') {
        this.locks.classList.remove('_none')
        this.tableLocks.table.classList.add('_none')
      } else {
        this.locks.classList.add('_none')
        this.tableLocks.table.classList.remove('_none')
      }
    }

    this.inputSearch && this.inputSearch.addEventListener('input', this.handleInputSearch.bind(this))
    this.btnSort && this.btnSort.addEventListener('click', this.handleBtnSortClick.bind(this))

    this.pagination.onChangeShowCount = (count, cntAll) => {
      this.changeQueryParams({ show_cnt: count, page: count == cntAll ? null : this.queryParams.page })
    }
    this.pagination.onPageChange = (page) => this.changeQueryParams({ page })
  }

  async getData(queryParams = {}) {
    return getLocksPower({ show_cnt: this.tables[0].gridOptions.paginationPageSize, ...queryParams })
  }

  onRender(data) {
    const { rooms_x_locks = [], cnt_all, cnt_pages, page } = data
    this.pagination.setPage(page, cnt_pages, cnt_all)

    if (rooms_x_locks.length) {
      this.locksContent.innerHTML = rooms_x_locks.map(lock => cardHtml(lock)).join('')
    } else {
      this.locksContent.innerHTML = `<div class="not-data"><span>Нет замков для отображения</span></div>`
    }
  }

  handleInputSearch(e) {
    const input = e.target
    input.value = extractNumbers(input.value)
    clearTimeout(this.timerInput)
    this.timerInput = setTimeout(() => {
      this.changeQueryParams({ search_str: input.value })
    }, 600)
  }

  handleBtnSortClick(e) {
    this.btnSort.classList.toggle('sort')
    let queryParams = { sort_column: 'electric_quantity' }

    if (this.btnSort.classList.contains('sort')) {
      queryParams.sort_direction = 'desc'
    } else {
      queryParams.sort_direction = 'asc'
    }

    this.changeQueryParams(queryParams)
  }

  async changeQueryParams(params) {
    this.queryParams = mergeQueryParams(this.queryParams, params)

    try {
      this.loader.enable()
      const dataEntities = await this.getData(this.queryParams)
      this.onRender(dataEntities)
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      this.loader.disable()
    }
  }
}

export default ChargingLocks