import Page from "../Page.js"
import { Select } from "../../modules/mySelect.js"
import { createCalendar } from "../../settings/createCalendar.js"
import { dateFormatter } from "../../settings/dateFormatter.js";

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

function subtractMonths(date, months) {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() - months);

  return newDate;
}

class Dashboards extends Page {
  constructor(options) {
    super(options)

    this.formFilter = this.wrapper.querySelector('.form-filter-dashboards')
    this.widgets = this.wrapper.querySelectorAll('[data-render-widget]')

    if (this.formFilter) {
      this.selectFilter = new Select({
        uniqueName: 'select-filter-main',
        parentEl: this.wrapper
      })
      this.calendars = createCalendar(`[data-content="${options.page}"] .input-date-filter`, {
        mode: "range",
        dateFormat: "d. M, Y",
        defaultDate: [subtractMonths(new Date(), 2), new Date()],
        onChange: (selectedDates, dateStr, instance) => {
          if (selectedDates.length === 2) {
            this.changeQueryParams({
              start_date: dateFormatter(selectedDates[0], 'yyyy-MM-dd'),
              end_date: dateFormatter(selectedDates[1], 'yyyy-MM-dd')
            })
          }
        }
      })

      this.queryParams = {
        start_date: dateFormatter(this.calendars.selectedDates[0], 'yyyy-MM-dd'),
        end_date: dateFormatter(this.calendars.selectedDates[1], 'yyyy-MM-dd'),
      }
    }

    if (this.selectFilter) {
      this.selectFilter.onChange = (e, select, optionValue) => {
        const name = select.getAttribute('data-name')
        const data = { [name]: optionValue }
        this.changeQueryParams(data)
      }
    }
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
      if (name === 'revenue' || name === 'this_month_revenue' || name === 'reestr_sum') {
        widget.innerText = Number.isInteger(+value) ? formatePrice(+value) + ' ₽' : ''
      } else {
        widget.innerHTML = value
      }
    });
  }

  async render(queryParams = this.queryParams) {
    try {
      this.loader.enable()
      const [dataDashboard = null, dataEntities = null] = await Promise.all([this.getDashboardData(queryParams), this.getData(queryParams)])

      if (dataDashboard) {
        this.renderWidgets(dataDashboard)
        this.actionsCharts(chart => chart.render(dataDashboard))
      }

      if (this.tables.length && dataEntities) {
        this.actionsTables((table, i) => table.onRendering(Array.isArray(dataEntities) ? dataEntities[i] : dataEntities))
      }
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      this.loader.disable()
    }
  }
}

export default Dashboards