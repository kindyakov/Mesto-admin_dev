import { Select } from "../../modules/mySelect.js"
import { createCalendar } from "../../settings/createCalendar.js"
import { getFormattedDate } from "../../utils/getFormattedDate.js"

class Dashboards {
  constructor({ loader, tables = [], tableSelector = '', TableComponent = null, page }) {
    this.loader = loader
    this.wrapper = document.querySelector(`[data-content="dashboards/${page}"]`)
    this.formFilter = this.wrapper.querySelector('.form-filter-dashboards')

    this.tables = []

    if (tables.length) {
      tables.forEach(table => {
        const { TableComponent, tableSelector } = table
        this.table = new TableComponent(tableSelector)
        this.tables.push(this.table)
      })
    }

    this.queryParams = {}

    this.widgets = this.wrapper.querySelectorAll('[data-render-widget]')

    this.init(page)
  }

  init(page) {
    if (this.formFilter) {
      this.selectFilter = new Select({
        uniqueName: 'select-filter-main',
        parentEl: this.wrapper
      })
      this.calendars = createCalendar(`[data-content="dashboards/${page}"] .input-date-filter`, {
        mode: "range",
        dateFormat: "d. M, Y",
        onChange: (selectedDates, dateStr, instance) => {
          if (selectedDates.length === 2) {
            this.changeQueryParams({
              start_date: getFormattedDate(selectedDates[0], 'YYYY-MM-DD'),
              end_date: getFormattedDate(selectedDates[1], 'YYYY-MM-DD')
            })
          }
        }
      })
    }

    this.events()
  }

  events() {
    this.tables.length && this.actionsTables(table => {
      table.onPageChange = page => this.renderTable(table, { page })
      table.onChangeTypeUser = ({ e, select, optionValue }) => this.renderTable(table, { user_type: optionValue })
      table.onValueInputSearch = value => {
        if (value !== '') {
          this.renderTable(table, { search_str: value })
        } else {
          this.renderTable(table)
        }
      }
    })

    if (this.selectFilter) {
      this.selectFilter.onChange = (e, select, optionValue) => {
        const name = select.getAttribute('data-name')
        const data = { [name]: optionValue }
        this.changeQueryParams(data)
      }
    }
  }

  changeQueryParams(data) {
    this.queryParams = { ...this.queryParams, ...data }
    this.renderDashboard(data)
  }

  renderWidgets(data) {
    if (!this.widgets.length) return
    this.widgets.forEach(widget => {
      const params = widget.getAttribute('data-render-widget')
      const [name, str] = params.split(',')
      widget.innerHTML = data[name] ? data[name] + `${str ? str : ''}` : 'Нет данных'
    });
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
      const [dataDashboard, dataEntities] = await Promise.all([this.getDashboardData(), this.getData()])

      if (dataDashboard) {
        this.renderWidgets(dataDashboard)
      }

      if (this.tables.length && dataEntities) {
        this.actionsTables(table => table.render(dataEntities))
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  async renderDashboard(data) {
    try {
      this.loader.enable()
      const resData = await this.getDashboardData(data)
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

export default Dashboards