import { getFormattedDate } from "../utils/getFormattedDate.js"
import { mergeQueryParams } from "../utils/buildQueryParams.js";

class Page {
  constructor({ loader, tables = [], page }) {
    this.loader = loader
    this.wrapper = document.querySelector(`[data-content="${page}"]`)

    this.tables = []

    if (tables.length) {
      tables.forEach(table => {
        const { TableComponent, tableSelector, options = {}, params = {} } = table
        this.table = new TableComponent(tableSelector, { ...options, wrapper: this.wrapper }, params)
        this.tables.push(this.table)
      })
    }

    this.queryParams = {}

    this.init(page)
  }

  onRender() {

  }

  init(page) {

    this.events()
  }

  events() {
    this.tables.length && this.actionsTables(table => {
      table.onPageChange = page => this.changeQueryParams({ page }, table)
      table.onValueInputSearch = value => {
        let data = {}

        if (value !== '') {
          data = { search_str: value }
        } else {
          data = {}
        }

        this.changeQueryParams(data, table)
      }
      table.selects.onChange = (e, select, value) => {
        const name = select.getAttribute('data-name')
        this.changeQueryParams({ [name]: value }, table)
      }

      if (table.calendar) {
        table.calendar.methods.onChange = (selectedDates, dateStr, instance) => {
          if (selectedDates.length === 2) {
            const [start, end] = instance.element.name.split(',')
            this.changeQueryParams({
              [start]: getFormattedDate(selectedDates[0], 'YYYY-MM-DD'),
              [end]: getFormattedDate(selectedDates[1], 'YYYY-MM-DD'),
            }, table)
          }
        }
      }
    })
  }

  changeQueryParams(params, table = null) {
    this.queryParams = mergeQueryParams(this.queryParams, params)
    if (table) {
      this.renderTable(table, this.queryParams)
    } else {
      this.render(this.queryParams)
    }
  }

  actionsTables(callback = () => { }) {
    if (!this.tables.length) return console.error('Нет таблиц')
    this.tables.forEach(table => {
      callback(table)
    })
  }

  async render(queryParams = {}) {
    try {
      this.loader.enable()
      const dataEntities = await this.getData(queryParams)

      if (this.tables.length && dataEntities) {
        this.actionsTables(table => table.render(dataEntities))
      }

      this.onRender(dataEntities)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  async renderTable(table, queryParams = {}) {
    try {
      this.loader.enable()
      const resData = await this.getData(queryParams)
      table?.render(resData)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default Page