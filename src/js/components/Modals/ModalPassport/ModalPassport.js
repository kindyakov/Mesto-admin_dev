import BaseModal from "../BaseModal.js";
import content from './content.html'
import { validatePassport } from "./validate.js";

import { Select } from '../../../modules/mySelect.js'

import { getClientTotal } from "../../../settings/request.js";
import { api } from "../../../settings/api.js";

import { getFormattedDate } from "../../../utils/getFormattedDate.js";
import { outputInfo } from "../../../utils/outputinfo.js";

class ModalPassport extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-passport'],
      ...options
    })

    this.selects = new Select({ uniqueName: 'select-passport' })
    this.init()
  }

  init() {
    if (!this.modalBody) return
    this.formPassportData = this.modalBody.querySelector('.form-passport-data')
    this.validator = validatePassport(this.formPassportData)
    this.events()
  }

  events() {
    this.modalBody.addEventListener('click', e => {
      if (e.target.closest('.btn-edit-client-data')) {
        this.handleClickEdit(e)
      }
    })
  }

  handleClickEdit(e) {
    const btn = e.target.closest('.btn-edit-client-data')
    if (btn.classList.contains('_is-edit')) {
      this.validator.revalidate().then(isValid => {
        if (isValid) {
          const formData = new FormData(this.formPassportData)
          let data = { user_id: this.userId }
          Array.from(formData).forEach(obj => data[obj[0]] = obj[1])

          this.editClient({ client: data }).finally(() => {
            btn.classList.remove('_is-edit')
            this.isEdit = false
            this.disableEditInput(this.formPassportData)
          })
        }
      })
    } else {
      btn.classList.add('_is-edit')
      this.isEdit = true
      this.enableEditInput(this.formPassportData)
    }
  }

  enableEditInput(form) {
    if (!form) return
    const inputs = form.querySelectorAll('input')
    inputs.length && inputs.forEach(input => {
      input.removeAttribute('readonly')
      input.classList.add('edit')
      input.classList.remove('not-edit')
    })

    this.validator?.calendar.set('clickOpens', true)
  }

  disableEditInput(form, arr = []) {
    if (form) {
      const inputs = form.querySelectorAll('input')

      inputs.length && inputs.forEach(input => {
        input.setAttribute('readonly', 'true')
        input.classList.remove('edit')
        input.classList.add('not-edit')
      })

      this.validator?.calendar.set('clickOpens', false)
    }

    if (arr.length) {
      arr.forEach(obj => obj.el.classList.remove(obj.delClass))
    }
  }

  onClose() {
    this.disableEditInput(this.formPassportData, [
      { el: this.modalBody.querySelector('.btn-edit-client-data'), delClass: '_is-edit' }
    ])
  }

  beforeClose() {
    if (this.isEdit) {
      outputInfo({
        msg: 'У вас есть несохраненные изменения.</br>Вы уверены, что хотите закрыть окно?',
        msg_type: 'warning',
        isConfirm: true
      }, isConfirm => {
        if (isConfirm) {
          this.isEdit = false
          this.close()
        }
      });

      return false;
    } else {
      return true;
    }
  }

  renderModal({ client }) {
    this.renderElements = this.modalBody.querySelectorAll('[data-render]')
    this.attrsModal = this.modalBody.querySelectorAll('[data-modal]')

    this.attrsModal.length && this.attrsModal.forEach(el => {
      el.setAttribute('data-json', JSON.stringify(client))
    })
    this.renderElements.length && this.renderElements.forEach(el => {
      const renderName = el.getAttribute('data-render')
      const value = client[renderName] ? client[renderName] : ''

      if (el.tagName === 'INPUT') {
        if (el.name === 'issue_date') {
          el.value = getFormattedDate(value)
        } else {
          el.value = value
        }
      } else if (el.tagName === 'IMG') {
        el.src = value
      } else if (el.classList.contains('wp-status')) {
        el.classList.remove('confirmed', 'not-confirmed')
        el.classList.add(`${value ? 'confirmed' : 'not-confirmed'}`)
      } else {
        el.textContent = value
      }
    })
  }

  async editClient(data) {
    try {
      this.loader.enable()
      const response = await api.post('/_edit_client_', data)
      if (response.status !== 200) return
      outputInfo(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  async onOpen(params = null) {
    if (!params) return
    try {
      this.loader.enable()
      const extractData = this.extractData(params)
      if (!extractData) return
      const data = await getClientTotal(extractData.user_id + '/')
      if (data) {
        this.renderModal(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalPassport = new ModalPassport()

export default modalPassport