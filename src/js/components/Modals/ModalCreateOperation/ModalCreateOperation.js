import BaseModal from "../BaseModal.js"
import content from './content.html'
import { validate } from './validate.js'
import { Select } from "../../../modules/mySelect.js";
import { outputInfo } from "../../../utils/outputinfo.js";
import { api } from "../../../settings/api.js";
import { dateFormatter } from "../../../settings/dateFormatter.js";
import { getCategories } from "../../../settings/request.js";


class ModalCreateOperation extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-create-operation'],
      ...options
    })

    this.categories = []
    this.subcategories = []
    this.editMode = false
    this.editData = null

    this.init()
  }

  init() {
    if (!this.modalBody) return

    this.selects = new Select({ uniqueName: 'select-modal-create-operation', parentEl: this.modalBody })

    this.form = this.modalBody.querySelector('.form-add-operation')
    this.btnCreateOperation = this.modalBody.querySelector('.btn-create-operation')
    this.categorySelect = this.modalBody.querySelector('[name="category"]')
    this.subcategorySelect = this.modalBody.querySelector('[name="subcategory_select"]')
    this.subcategoryInput = this.modalBody.querySelector('[name="subcategory"]')
    this.warehouseSelect = this.modalBody.querySelector('[name="warehouse_id"]')
    this.amountInput = this.modalBody.querySelector('[name="amount"]')
    this.commentInput = this.modalBody.querySelector('[name="comment"]')
    this.operationDateInput = this.modalBody.querySelector('[name="operation_date"]')
    this.modalTitle = this.modalBody.querySelector('.modal__title')

    this.validator = validate(this.form, { container: this.modalBody })

    this.events()
    this.setupSubcategoryInputHandler()
  }

  events() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this))
    this.btnCreateOperation.addEventListener('click', this.handleSubmit.bind(this))
  }

  async onOpen(params) {
    if (!params) return

    this.editMode = false
    this.editData = null
    this.updateUI()

    await this.fetchCategories()
    this.populateWarehouses()
    this.populateCategories()
    this.populateSubcategories()
    this.setupCategoryChangeHandler()
    this.setDefaultWarehouse()

    this.selects.init()
  }

  async openForEdit(data) {
    this.editMode = true
    this.editData = data

    await this.fetchCategories()
    this.populateWarehouses()
    this.populateCategories()
    this.populateSubcategories()
    this.setupCategoryChangeHandler()

    this.updateUI()
    this.fillFormWithData(data)

    this.selects.init()
  }

  updateUI() {
    if (this.editMode) {
      this.modalTitle.textContent = 'Редактирование операции'
      this.btnCreateOperation.querySelector('span').textContent = 'Сохранить изменения'
    } else {
      this.modalTitle.textContent = 'Добавление платежа'
      this.btnCreateOperation.querySelector('span').textContent = 'Добавить платеж'
    }
  }

  fillFormWithData(data) {
    if (!data) return

    // Заполняем поля формы
    if (this.operationDateInput && data.operation_date) {
      this.operationDateInput.value = dateFormatter(data.operation_date)
    }

    if (this.categorySelect && data.category) {
      this.categorySelect.value = data.category
    }

    if (this.subcategoryInput && data.subcategory) {
      this.subcategoryInput.value = data.subcategory
    }

    if (this.subcategorySelect && data.subcategory) {
      this.setSubcategorySelectValue(data.subcategory)
    }

    if (this.warehouseSelect && data.warehouse_id) {
      this.warehouseSelect.value = data.warehouse_id
    }

    if (this.amountInput && data.amount) {
      this.amountInput.value = data.amount
    }

    if (this.commentInput && data.comment) {
      this.commentInput.value = data.comment
    }
  }

  onClose() {
    if (this.form) {
      this.form.reset()
      this.validator?.refresh()
    }
    this.categories = []
    this.subcategories = []
    this.editMode = false
    this.editData = null
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

    let warehouses = window.app.warehouses;

    // В режиме редактирования фильтруем склады с warehouse_id === 0
    if (this.editMode) {
      warehouses = warehouses.filter(warehouse => warehouse.warehouse_id !== 0);
    }

    const optionsHtml = warehouses
      .map(warehouse => `<option value="${warehouse.warehouse_id}">${warehouse.warehouse_name}</option>`)
      .join('')

    this.warehouseSelect.innerHTML = optionsHtml
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

    const options = this.subcategories
      .filter(subcategory => subcategory)
      .map(subcategory => `<option value="${subcategory}">${subcategory}</option>`)

    this.subcategorySelect.innerHTML = ['<option value="">Выберите подкатегорию</option>', ...options].join('')

    const currentValue = this.subcategoryInput?.value?.trim()

    if (currentValue && this.setSubcategorySelectValue(currentValue)) {
      return
    }

    this.subcategorySelect.value = ''
  }

  setupCategoryChangeHandler() {
    if (!this.categorySelect) return

    this.categorySelect.addEventListener('change', (e) => {
      const selectedCategoryId = e.target.value
      this.populateSubcategories(selectedCategoryId)
      this.selects?.init()
      if (this.subcategoryInput) {
        this.subcategoryInput.value = ''
      }
      this.clearSubcategorySelect()
    })
  }

  handleCategoryChange(e) {
    const selectedCategoryId = e.target.value
    this.populateSubcategories(selectedCategoryId)
  }

  setupSubcategoryInputHandler() {
    if (!this.subcategorySelect || !this.subcategoryInput) return

    this.subcategorySelect.addEventListener('change', this.handleSubcategorySelectChange.bind(this))
    this.subcategoryInput.addEventListener('input', () => {
      this.clearSubcategorySelect()
    })
  }

  handleSubcategorySelectChange(e) {
    const value = e.target.value
    if (!value) return
    this.subcategoryInput.value = value
  }

  clearSubcategorySelect() {
    if (!this.subcategorySelect) return
    this.subcategorySelect.value = ''
    this.resetCustomSubcategoryValue()
  }

  resetCustomSubcategoryValue(value = '') {
    if (!this.selects || typeof this.selects.setValue !== 'function') return
    if (!this.selects.selectsCustom || !this.selects.selectsCustom.length) return
    this.selects.setValue(value, 'subcategory_select')
  }

  setSubcategorySelectValue(value) {
    if (!this.subcategorySelect || !value) return false
    const hasOption = Array.from(this.subcategorySelect.options).some(option => option.value === value)

    if (hasOption) {
      this.subcategorySelect.value = value
      return true
    }

    return false
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

      const subcategoryValue = formData.get('subcategory')?.trim()
      if (subcategoryValue) {
        formData.set('subcategory', subcategoryValue)
      } else if (this.subcategorySelect?.value) {
        formData.set('subcategory', this.subcategorySelect.value)
      }

      formData.delete('flatpickr-month')
      // Convert FormData to object
      Array.from(formData).forEach(arr => data[arr[0]] = arr[1])

      // Add warehouse context
      if (!data.warehouse_id && window.app.warehouse) {
        data.warehouse_id = window.app.warehouse.warehouse_id
      }

      // Convert warehouse_id and amount to numbers
      if (data.warehouse_id) {
        data.warehouse_id = Number(data.warehouse_id)
      }
      if (data.amount) {
        data.amount = Number(data.amount)
      }

      // Add operation_id for edit mode (as number)
      if (this.editMode && this.editData?.operation_id) {
        data.operation_id = Number(this.editData.operation_id)
      }

      const action = this.editMode ? this.editOperation(data) : this.createOperation(data)

      action
        .then((response) => {
          if (response?.msg_type == 'success') {
            const operationsTable = window.app.modalMap?.['modal-operations']
            operationsTable?.refresh()

            if (this.editMode) {
              this.close()
            } else {
              if (this.amountInput) {
                this.amountInput.value = ''
              }
              if (this.commentInput) {
                this.commentInput.value = ''
              }
              if (this.subcategoryInput) {
                this.subcategoryInput.value = ''
              }
              this.clearSubcategorySelect()
            }
          }
        })
        .finally(() => {
          this.validator?.refresh()
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
      return { msg_type: 'error' }
    } finally {
      this.loader.disable()
    }
  }

  async editOperation(data) {
    try {
      this.loader.enable()
      const response = await api.post(`/_edit_operation_`, data)
      if (response.status !== 200) return
      outputInfo(response.data)

      return response.data
    } catch (error) {
      console.error(error)
      window.app.notify.show({
        msg: 'Ошибка редактирования операции',
        msg_type: 'error'
      })
      return { msg_type: 'error' }
    } finally {
      this.loader.disable()
    }
  }
}

const modalCreateOperation = new ModalCreateOperation()

export default modalCreateOperation