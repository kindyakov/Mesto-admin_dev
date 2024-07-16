import { getFormattedDate } from "../utils/getFormattedDate.js"

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
      table.onPageChange = page => this.changeQueryParams(table, { page })
      table.onValueInputSearch = value => {
        let data = {}

        if (value !== '') {
          data = { search_str: value }
        } else {
          data = {}
        }

        this.changeQueryParams(table, data)
      }
      table.selects.onChange = (e, select, value) => {
        const name = select.getAttribute('data-name')
        this.changeQueryParams(table, { [name]: value })
      }

      if (table.calendar) {
        table.calendar.methods.onChange = (selectedDates, dateStr, instance) => {
          if (selectedDates.length === 2) {
            const [start, end] = instance.element.name.split(',')
            this.changeQueryParams(table, {
              [start]: getFormattedDate(selectedDates[0], 'YYYY-MM-DD'),
              [end]: getFormattedDate(selectedDates[1], 'YYYY-MM-DD'),
            })
          }
        }
      }
    })
  }

  changeQueryParams(table, data) {
    this.queryParams = { ...this.queryParams, ...data }
    this.renderTable(table, this.queryParams)
  }

  actionsTables(callback = () => { }) {
    if (!this.tables.length) return console.error('Нет таблиц')
    this.tables.forEach(table => {
      callback(table)
    })
  }

  async render() {
    try {
      this.loader.enable()
      const dataEntities = await this.getData()

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

  async renderTable(table, data = {}) {
    try {
      this.loader.enable()
      const resData = await this.getData(data)
      table.render(resData)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default Page