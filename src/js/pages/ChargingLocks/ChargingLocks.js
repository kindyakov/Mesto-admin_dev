import Page from "../Page.js"
import TableLocks from "../../components/Tables/TableLocks/TableLocks.js";
import FilterLocks from "../../components/Filters/FilterLocks/FilterLocks.js";

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
    // this.filterLocks = new FilterLocks(this.wrapper.querySelector('.btn-set-filters'))
    this.locksContent = this.wrapper.querySelector('.locks')
    this.inputSearch = this.wrapper.querySelector('.input-search')
    this.btnSort = this.wrapper.querySelector('.btn-set-sort')

    this.customSelect.onChange = (e, select, value) => {
      if (value === 'tile') {
        this.locksContent.classList.remove('_none')
        this.tableLocks.table.classList.add('_none')
      } else {
        this.locksContent.classList.add('_none')
        this.tableLocks.table.classList.remove('_none')
      }
    }

    this.inputSearch && this.inputSearch.addEventListener('input', this.handleInputSearch.bind(this))
    this.btnSort && this.btnSort.addEventListener('click', this.handleBtnSortClick.bind(this))
  }

  async getData(queryParams = {}) {
    return getLocksPower({ show_cnt: this.tables[0].gridOptions.paginationPageSize, ...queryParams })
  }

  onRender(data) {
    const { rooms_x_locks = [] } = data

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
}

export default ChargingLocks