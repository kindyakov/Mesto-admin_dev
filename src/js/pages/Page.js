import { mergeQueryParams } from "../utils/buildQueryParams.js";

class Page {
  constructor({ loader, tables = [], charts = [], page }) {
    this.loader = loader
    this.wrapper = document.querySelector(`[data-content="${page}"]`)
    this.app = window.app

    this.tables = []
    this.charts = []
    this.queryParams = {}
    if (tables.length) {
      tables.forEach(table => {
        const { TableComponent, tableSelector, options = {}, params = {} } = table
        this.table = new TableComponent(tableSelector, { ...options, wrapper: this.wrapper }, params)
        this.tables.push(this.table)
      })
    }

    if (charts.length) {
      charts.forEach(_chart => {
        const { id, ChartComponent, options = {} } = _chart
        const ctx = this.wrapper.querySelector(`#${id}`)
        const chart = new ChartComponent(ctx, options)
        chart.wrapper = this.wrapper
        this.charts.push(chart)
      })
    }

    this.init(page)
  }

  onRender() {

  }

  init(page) {

    this.events()
  }

  events() {
    
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
    this.tables.forEach((table, i) => {
      callback(table, i)
    })
  }

  actionsCharts(callback = () => { }) {
    if (!this.charts.length) return
    this.charts.forEach((chart, i) => {
      callback(chart, i)
    })
  }

  async getData(queryParams = {}) {
    return []
  }

  async render(queryParams = this.queryParams) {
    try {
      this.loader.enable()
      const dataEntities = await this.getData(queryParams)

      if (this.tables.length && dataEntities) {
        this.actionsTables((table, i) => table.onRendering(Array.isArray(dataEntities) ? dataEntities[i] : dataEntities))
      }

      this.onRender(dataEntities)
    } catch (error) {
      console.error(error)
      throw error
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
      throw error
    } finally {
      this.loader.disable()
    }
  }
}

export default Page