import Page from "../Page.js"
import { Select } from "../../modules/mySelect.js"
import { createCalendar } from "../../settings/createCalendar.js"
import { dateFormatter } from "../../settings/dateFormatter.js";
import tippy from '../../configs/tippy.js'
// import { inputValidator } from "../../settings/validates.js";

function formatePrice(value) {
  if (!value) return ''
  const units = ['', 'тыс.', 'млн.', 'млрд.', 'трлн.']
  let unitIndex = 0

  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000
    unitIndex++
  }

  return value.toFixed(1) + ' ' + units[unitIndex]
}

class Dashboards extends Page {
  constructor(options) {
    super(options)

    this.formFilter = this.wrapper.querySelector('.form-filter-dashboards')
    this.widgets = this.wrapper.querySelectorAll('[data-render-widget]')

    if (this.formFilter) {
      this.app.defaultDate = this.app.defaultDate || [this.subtractMonths(new Date(), 2), new Date()]

      this.selectFilter = new Select({
        uniqueName: 'select-filter-main',
        parentEl: this.wrapper
      })
      this.calendars = createCalendar(`[data-content="${options.page}"] .input-date-filter`, {
        mode: "range",
        dateFormat: "d. M, Y",
        defaultDate: this.app.defaultDate,
        onChange: (selectedDates, dateStr, instance) => {
          if (selectedDates.length === 2) {
            this.app.defaultDate = selectedDates
            this.changeQueryParams({
              start_date: dateFormatter(selectedDates[0], 'yyyy-MM-dd'),
              end_date: dateFormatter(selectedDates[1], 'yyyy-MM-dd')
            })
          }
        }
      })

      this.inputsFilter = this.wrapper.querySelectorAll('.input-filter')

      this.inputsFilter.length && this.inputsFilter.forEach(input => {
        let timer
        input.addEventListener('input', () => {
          clearTimeout(timer)
          timer = setTimeout(() => {
            this.changeQueryParams({ [input.name]: input.value })
          }, 600);
        })
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

  subtractMonths(date, months) {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - months);

    return newDate;
  }

  renderWidgets(data) {
    this.widgets = this.wrapper.querySelectorAll('[data-render-widget]')
    const tippys = this.wrapper.querySelectorAll('[data-render-tippy]')

    if (tippys.length) {
      tippys.forEach(el => {
        const [name, type] = el.getAttribute('data-render-tippy').split(',')
        const { start_date, end_date } = this.queryParams

        const newContent = `<span class="tippy-info-span tippy-info-date">
        ${type == 'start'
            ? `${dateFormatter(new Date(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-1`))} - ${dateFormatter(end_date)}`
            : `${dateFormatter(start_date)} - ${dateFormatter(end_date)}`}
        </span>`

        if (el._tippy) {
          el._tippy.setContent(newContent)
        } else {
          tippy(el, {
            content: newContent,
            trigger: 'mouseenter',
            offset: [0, 0],
            placement: 'top-start',
            arrow: true,
            interactive: false,
          })
        }
      })
    }

    if (!this.widgets.length) return
    this.widgets.forEach(widget => {
      const params = widget.getAttribute('data-render-widget')
      const [name, str] = params.split(',')
      const value = data[name] ? data[name] + `${str ? str : ''}` : 'В процессе доработки'
      if (!data[name]) {
        // widget.style.fontSize = '16px'
      }
      if (name === 'revenue' || name === 'this_month_revenue' || name === 'reestr_sum') {
        widget.innerText = Number.isInteger(+value) ? formatePrice(+value) + ' ₽' : ''
      } else {
        widget.innerHTML = value
      }
    });
  }

  onRender() {

  }

  getDashboardData() {
    return []
  }

  async render(queryParams = {}) {
    try {
      this.loader.enable()
      const [dataDashboard = null, dataEntities = null] = await Promise.all([
        this.getDashboardData({ ...this.queryParams, ...queryParams }),
        this.getData(queryParams),
      ])

      if (dataDashboard) {
        this.renderWidgets(dataDashboard)
        this.actionsCharts(chart => chart.render(dataDashboard))
      }

      if (this.tables.length && dataEntities) {
        this.actionsTables((table, i) => table.onRendering(Array.isArray(dataEntities) ? dataEntities[i] : dataEntities))
      }

      if (this.calendars && this.app.defaultDate) {
        this.calendars.setDate(this.app.defaultDate)
      }

      this.onRender(dataDashboard, dataEntities)
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      this.loader.disable()
    }
  }
}

export default Dashboards