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
    this.handlersInitialized = false

    this.init()
  }

  init() {
    if (!this.modalBody) return

    this.selects = new Select({ uniqueName: 'select-modal-create-operation', parentEl: this.modalBody })

    this.form = this.modalBody.querySelector('.form-add-operation')
    this.btnCreateOperation = this.modalBody.querySelector('.btn-create-operation')
    this.categorySelect = this.modalBody.querySelector('[name="category_select"]')
    this.categoryInput = this.modalBody.querySelector('[name="category_input"]')
    this.categoryInputWrapper = this.modalBody.querySelector('[data-field="category-input"]')
    this.subcategorySelect = this.modalBody.querySelector('[name="subcategory_select"]')
    this.subcategoryInput = this.modalBody.querySelector('[name="subcategory_input"]')
    this.subcategoryInputWrapper = this.modalBody.querySelector('[data-field="subcategory-input"]')
    this.warehouseSelect = this.modalBody.querySelector('[name="warehouse_id"]')
    this.amountInput = this.modalBody.querySelector('[name="amount"]')
    this.commentInput = this.modalBody.querySelector('[name="comment"]')
    this.operationDateInput = this.modalBody.querySelector('[name="operation_date"]')
    this.modalTitle = this.modalBody.querySelector('.modal__title')

    this.validator = validate(this.form, { container: this.modalBody })

    this.events()
    this.setupCategoryHandler()
    this.setupSubcategoryHandler()
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

    this.updateUI()
    await this.fillFormWithData(data)

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

  async fillFormWithData(data) {
    if (!data) return

    // Заполняем поля формы
    if (this.operationDateInput && data.operation_date) {
      this.operationDateInput.value = dateFormatter(data.operation_date)
    }

    if (this.warehouseSelect && data.warehouse_id) {
      this.warehouseSelect.value = data.warehouse_id
    }

    if (this.categorySelect && data.category) {
      // Проверяем есть ли категория в списке
      const hasCategory = this.categories.includes(data.category)
      if (hasCategory) {
        this.categorySelect.value = data.category
        // Загружаем подкатегории для этой категории
        await this.loadSubcategories(data.category)
      } else {
        // Если категории нет в списке, показываем поле ввода
        this.categorySelect.value = 'new_category'
        if (this.categoryInputWrapper) this.categoryInputWrapper.style.display = 'block'
        if (this.categoryInput) this.categoryInput.value = data.category
      }
    }

    if (data.subcategory) {
      // Ждем немного, чтобы подкатегории загрузились
      await new Promise(resolve => setTimeout(resolve, 150))

      // Проверяем есть ли подкатегория в списке
      const hasSubcategory = Array.from(this.subcategorySelect.options).some(opt => opt.value === data.subcategory)
      if (hasSubcategory) {
        this.subcategorySelect.value = data.subcategory
      } else {
        // Если подкатегории нет в списке, показываем поле ввода
        this.subcategorySelect.value = 'new_subcategory'
        if (this.subcategoryInputWrapper) this.subcategoryInputWrapper.style.display = 'block'
        if (this.subcategoryInput) this.subcategoryInput.value = data.subcategory
      }
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

    // Скрываем поля ввода при закрытии
    if (this.categoryInputWrapper) this.categoryInputWrapper.style.display = 'none'
    if (this.subcategoryInputWrapper) this.subcategoryInputWrapper.style.display = 'none'
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

    const options = this.categories
      .map(category => `<option value="${category}">${category}</option>`)

    this.categorySelect.innerHTML = [
      '<option value="">Выберите категорию</option>',
      ...options,
      '<option value="new_category">+ Новая категория</option>'
    ].join('')
  }

  populateSubcategories() {
    if (!this.subcategorySelect) return

    this.subcategorySelect.innerHTML = '<option value="">Выберите подкатегорию</option><option value="new_subcategory">+ Новая подкатегория</option>'
  }

  setupCategoryHandler() {
    if (!this.categorySelect || this.handlersInitialized) return

    this.categorySelect.addEventListener('change', async (e) => {
      const value = e.target.value

      if (value === 'new_category') {
        // Показываем поле ввода новой категории
        if (this.categoryInputWrapper) this.categoryInputWrapper.style.display = 'block'
        this.categoryInput?.focus()
        // Очищаем подкатегории
        this.subcategorySelect.innerHTML = '<option value="">Выберите подкатегорию</option><option value="new_subcategory">+ Новая подкатегория</option>'
        this.selects.init()
      } else {
        // Скрываем поле ввода
        if (this.categoryInputWrapper) this.categoryInputWrapper.style.display = 'none'
        if (this.categoryInput) this.categoryInput.value = ''

        // Загружаем подкатегории для выбранной категории
        if (value) {
          await this.loadSubcategories(value)
        } else {
          this.subcategorySelect.innerHTML = '<option value="">Выберите подкатегорию</option><option value="new_subcategory">+ Новая подкатегория</option>'
          this.selects.init()
        }
      }

      // Скрываем поле ввода подкатегории и очищаем
      if (this.subcategoryInputWrapper) this.subcategoryInputWrapper.style.display = 'none'
      if (this.subcategoryInput) this.subcategoryInput.value = ''
      this.subcategorySelect.value = ''
    })
  }

  setupSubcategoryHandler() {
    if (!this.subcategorySelect || this.handlersInitialized) return

    this.handlersInitialized = true

    this.subcategorySelect.addEventListener('change', (e) => {
      const value = e.target.value

      if (value === 'new_subcategory') {
        // Показываем поле ввода новой подкатегории
        if (this.subcategoryInputWrapper) this.subcategoryInputWrapper.style.display = 'block'
        this.subcategoryInput?.focus()
      } else {
        // Скрываем поле ввода
        if (this.subcategoryInputWrapper) this.subcategoryInputWrapper.style.display = 'none'
        if (this.subcategoryInput) this.subcategoryInput.value = ''
      }
    })
  }

  async loadSubcategories(category) {
    try {
      const response = await api.get('/_get_subcategories_', { params: { category } })

      if (response.status === 200 && response.data.subcategories) {
        const subcategories = response.data.subcategories

        const options = subcategories
          .filter(sub => sub)
          .map(sub => `<option value="${sub}">${sub}</option>`)

        this.subcategorySelect.innerHTML = [
          '<option value="">Выберите подкатегорию</option>',
          ...options,
          '<option value="new_subcategory">+ Новая подкатегория</option>'
        ].join('')

        this.selects.init()
      }
    } catch (error) {
      console.error('Error loading subcategories:', error)
      this.subcategorySelect.innerHTML = '<option value="">Выберите подкатегорию</option><option value="new_subcategory">+ Новая подкатегория</option>'
      this.selects.init()
    }
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

      // Обработка категории
      const categorySelect = formData.get('category_select')
      const categoryInput = formData.get('category_input')?.trim()
      if (categorySelect === 'new_category' && categoryInput) {
        formData.set('category', categoryInput)
      } else if (categorySelect) {
        formData.set('category', categorySelect)
      }
      formData.delete('category_select')
      formData.delete('category_input')

      // Обработка подкатегории (необязательная для новых категорий)
      const subcategorySelect = formData.get('subcategory_select')
      const subcategoryInput = formData.get('subcategory_input')?.trim()
      if (subcategorySelect === 'new_subcategory' && subcategoryInput) {
        formData.set('subcategory', subcategoryInput)
      } else if (subcategorySelect && subcategorySelect !== 'new_subcategory') {
        formData.set('subcategory', subcategorySelect)
      } else {
        // Для новых категорий subcategory может отсутствовать
        formData.set('subcategory', '')
      }
      formData.delete('subcategory_select')
      formData.delete('subcategory_input')

      // Convert FormData to object
      Array.from(formData).forEach(arr => data[arr[0]] = arr[1])

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
              // Очищаем только amount и comment после создания
              if (this.amountInput) {
                this.amountInput.value = ''
              }
              if (this.commentInput) {
                this.commentInput.value = ''
              }

              // Очищаем поля ввода категории и подкатегории если они видимы
              if (this.categoryInput) {
                this.categoryInput.value = ''
              }
              if (this.subcategoryInput) {
                this.subcategoryInput.value = ''
              }

              // Скрываем поля ввода
              if (this.categoryInputWrapper) this.categoryInputWrapper.style.display = 'none'
              if (this.subcategoryInputWrapper) this.subcategoryInputWrapper.style.display = 'none'
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