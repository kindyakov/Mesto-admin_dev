import Page from "../Page.js"
import TableLocks from "../../components/Tables/TableLocks/TableLocks.js";
import FilterLocks from "../../components/Filters/FilterLocks/FilterLocks.js";
import { getLocksPower } from "../../settings/request.js";
import { Select } from "../../modules/mySelect.js";
import { cardHtml } from "./html.js";
import { createCalendar } from "../../settings/createCalendar.js";

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
          }
        }
      ],
      page: 'charging-locks'
    });

    this.tableLocks = this.tables[0]
    this.customSelect = new Select({ uniqueName: 'select-change-display' })
    this.filterLocks = new FilterLocks(this.wrapper.querySelector('.btn-set-filters'))
    this.locksContent = this.wrapper.querySelector('.locks')
    this.calendar = createCalendar(this.wrapper.querySelector('.input-date-filter'))

    this.customSelect.onChange = (e, select, value) => {
      if (value === 'tile') {
        this.locksContent.classList.remove('_none')
        this.tableLocks.table.classList.add('_none')
      } else {
        this.locksContent.classList.add('_none')
        this.tableLocks.table.classList.remove('_none')
      }
    }
  }

  async getData() {
    return getLocksPower()
  }

  onRender(data) {
    const { rooms = [], locks = [] } = data
    const customData = {}

    if (rooms.length) {
      rooms.forEach(room => {
        customData[room.lock_id] = room.room_id
      })
    }

    if (locks.length) {
      locks.forEach(lock => lock.room_id = customData[lock.lock_id])
      this.locksContent.innerHTML = locks.map(lock => cardHtml(lock)).join('')
      this.tableLocks.render(locks)
    } else {
      this.locksContent.innerHTML = `<div class="not-data"><span>Нет замков для отображения</span></div>`
    }
  }
}
// _get_locks_power_
export default ChargingLocks