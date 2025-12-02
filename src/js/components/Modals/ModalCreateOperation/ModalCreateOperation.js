import BaseModal from "../BaseModal.js"
import content from './content.html'
import { validate } from './validate.js'
import { Select } from "../../../modules/mySelect.js";
import { outputInfo } from "../../../utils/outputinfo.js";
import { api } from "../../../settings/api.js";
import { dateFormatter } from "../../../settings/dateFormatter.js";
import { getCategories } from "../../../settings/request.js";


class ModalCreateOperation extends BaseModal {
  constructor(steps, options = {}) {
    super(content, {
      cssClass: ['modal-create-operation'],
      ...options
    })

    this.categories = []
    this.subcategories = []

    this.init()
  }

  init() {
    if (!this.modalBody) return

    this.selects = new Select({ uniqueName: 'select-modal-create-operation', parentEl: this.modalBody })

    this.form = this.modalBody.querySelector('.form-add-operation')
    this.btnCreateOperation = this.modalBody.querySelector('.btn-create-operation')
    this.categorySelect = this.modalBody.querySelector('[name="category"]')
    this.subcategorySelect = this.modalBody.querySelector('[name="subcategory"]')
    this.warehouseSelect = this.modalBody.querySelector('[name="warehouse_id"]')
    this.amountInput = this.modalBody.querySelector('[name="amount"]')

    this.validator = validate(this.form, { container: this.modalBody })

    this.events()
  }

  events() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this))
    this.btnCreateOperation.addEventListener('click', this.handleSubmit.bind(this))
  }

  async onOpen(params) {
    if (!params) return
    await this.fetchCategories()
    this.populateWarehouses()
    this.populateCategories()
    this.setupCategoryChangeHandler()
    this.setDefaultWarehouse()
    this.selects.init()
  }

  onClose() {
    if (this.form) {
      this.form.reset()
      this.validator?.refresh()
    }
    this.categories = []
    this.subcategories = []
  }

  async fetchCategories() {
    try {
      const { categories = [], subcategories = [] } = await getCategories()

      this.categories = categories
      this.subcategories = subcategories
    } catch (error) {
      console.error('Error fetching categories:', error)
      window.app.notify.show({
        msg: 'Ошибка загрузки категорий',
        msg_type: 'error'
      })
    }
  }

  populateWarehouses() {
    if (!this.warehouseSelect || !window.app.warehouses) return

    const optionsHtml = window.app.warehouses
      .map(warehouse => `<option value="${warehouse.warehouse_id}">${warehouse.warehouse_name}</option>`)
      .join('')

    this.warehouseSelect.innerHTML = '<option value="">Выберите склад</option>' + optionsHtml
  }

  populateCategories() {
    if (!this.categorySelect) return

    const optionsHtml = this.categories
      .map(category => `<option value="${category}">${category}</option>`)
      .join('')

    this.categorySelect.innerHTML = optionsHtml
  }

  populateSubcategories() {
    if (!this.subcategorySelect) return

    const optionsHtml = this.subcategorySelect
      .filter(subcategory => subcategory)
      .map(subcategory => `<option value="${subcategory}">${subcategory}</option>`)
      .join('')

    this.subcategorySelect.innerHTML = optionsHtml
  }

  setupCategoryChangeHandler() {
    if (!this.categorySelect) return

    this.categorySelect.addEventListener('change', (e) => {
      const selectedCategoryId = e.target.value
      this.populateSubcategories(selectedCategoryId)
    })
  }

  handleCategoryChange(e) {
    const selectedCategoryId = e.target.value
    this.populateSubcategories(selectedCategoryId)
  }

  setDefaultWarehouse() {
    if (!this.warehouseSelect || !window.app.warehouse) return

    this.warehouseSelect.value = window.app.warehouse.warehouse_id
  }

  handleSubmit() {
    this.validator.revalidate().then(isValid => {
      if (!isValid) return

      const formData = new FormData(this.form)
      let data = {}

      // Format date
      const operationDate = formData.get('operation_date')
      if (operationDate) {
        formData.set('operation_date', dateFormatter(operationDate, 'yyyy-MM-dd'))
      }

      // Format amount - remove non-numeric characters
      const amount = formData.get('amount')
      if (amount) {
        formData.set('amount', amount.replace(/[^0-9]/g, ''))
      }

      // Convert FormData to object
      Array.from(formData).forEach(arr => data[arr[0]] = arr[1])

      // Add warehouse context
      if (!data.warehouse_id && window.app.warehouse) {
        data.warehouse_id = window.app.warehouse.warehouse_id
      }

      this.createOperation(data)
        .then(({ msg_type = '' }) => {
          if (msg_type == 'success') {
            this.close()
            // Refresh parent table if exists
            const operationsTable = window.app.modalMap?.['modal-operations']
            if (operationsTable && operationsTable.refresh) {
              operationsTable.refresh()
            }
          }
        })
        .finally(() => {
          this.validator?.refresh()
          this.form.reset()
          this.setDefaultWarehouse()
          this.populateCategories()
          this.populateSubcategories()
        })
    })
  }

  async createOperation(data) {
    try {
      this.loader.enable()
      const response = await api.post(`/_add_operation_`, data)
      if (response.status !== 200) return
      outputInfo(response.data)
      return response.data
    } catch (error) {
      console.error(error)
      window.app.notify.show({
        msg: 'Ошибка создания операции',
        msg_type: 'error'
      })
    } finally {
      this.loader.disable()
    }
  }
}

const modalCreateOperation = new ModalCreateOperation()

export default modalCreateOperation