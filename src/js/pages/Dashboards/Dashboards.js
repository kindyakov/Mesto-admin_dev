import { Select } from "../../modules/mySelect.js"
import { createCalendar } from "../../settings/createCalendar.js"
import { getFormattedDate } from "../../utils/getFormattedDate.js"

function formatePrice(value) {
  if (!value) return ''
  const units = ['', 'тыс', 'млн', 'млрд', 'трлн']
  let unitIndex = 0

  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000
    unitIndex++
  }

  return value.toFixed(3) + ' ' + units[unitIndex]
}

class Dashboards {
  constructor({ loader, tables = [], charts = [], page }) {
    this.loader = loader
    this.wrapper = document.querySelector(`[data-content="dashboards/${page}"]`)
    this.formFilter = this.wrapper.querySelector('.form-filter-dashboards')

    this.tables = []
    this.charts = []

    if (tables.length) {
      tables.forEach(table => {
        const { TableComponent, tableSelector, options = {}, params = {}
        } = table
        this.table = new TableComponent(tableSelector, { ...options, wrapper: this.wrapper }, params)
        this.tables.push(this.table)
      })
    }

    if (charts.length) {
      charts.forEach(_chart => {
        const { id, ChartComponent, options = {} } = _chart
        const ctx = this.wrapper.querySelector(`#${id}`)
        const chart = new ChartComponent(ctx, options)
        this.charts.push(chart)
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
    this.widgets = this.wrapper.querySelectorAll('[data-render-widget]')

    if (!this.widgets.length) return
    this.widgets.forEach(widget => {
      const params = widget.getAttribute('data-render-widget')
      const [name, str] = params.split(',')
      const value = data[name] ? data[name] + `${str ? str : ''}` : 'В процессе доработки'
      if (!data[name]) {
        widget.style.fontSize = '16px'
      }
      if (name === 'revenue') {
        widget.innerText = Number.isInteger(+value) ? formatePrice(+value) + ' ₽' : ''
      } else {
        widget.innerHTML = value
      }
    });
  }

  actionsTables(callback = () => { }) {
    if (!this.tables.length) return console.error('Нет таблиц')
    this.tables.forEach(table => {
      callback(table)
    })
  }

  actionsCharts(callback = () => { }) {
    if (!this.charts.length) return
    this.charts.forEach(chart => {
      callback(chart)
    })
  }

  async render() {
    try {
      this.loader.enable()
      const [dataDashboard, dataEntities] = await Promise.all([this.getDashboardData(), this.getData()])

      if (dataDashboard) {
        this.renderWidgets(dataDashboard)
        this.actionsCharts(chart => chart.render(dataDashboard))
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