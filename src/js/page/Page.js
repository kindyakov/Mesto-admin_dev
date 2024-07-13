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

  init(page) {

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

  actionsTables(callback = () => { }) {
    if (!this.tables.length) return console.error('Нет таблиц')
    this.tables.forEach(table => {
      callback(table)
    })
  }

  async render() {
    try {
      this.loader.enable()
      const [dataEntities] = await Promise.all([this.getData()])

      if (this.tables.length && dataEntities) {
        this.actionsTables(table => table.render(dataEntities))
      }
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