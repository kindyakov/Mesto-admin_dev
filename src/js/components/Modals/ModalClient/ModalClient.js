import BaseModal from "../BaseModal.js";
import content from './content.html'

import { agreementHtml } from "./html.js";
import { validateClient } from "./validate.js";

import { getClientTotal } from "../../../settings/request.js";
import { api } from "../../../settings/api.js";
import { formatPhoneNumber } from "../../../utils/formattingPrice.js";
import { getFormattedDate } from "../../../utils/getFormattedDate.js";
import { outputInfo } from "../../../utils/outputinfo.js";

class ModalClient extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-client'],
      ...options
    })
    this.userId = null
    this.isEdit = false

    this.init()
  }

  init() {
    if (!this.modalBody) return
    this.formClientData = this.modalBody.querySelector('.form-client-data')
    this.validatorClient = validateClient(this.formClientData)
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
      this.validatorClient.revalidate().then(isValid => {
        if (isValid) {
          const formData = new FormData(this.formClientData)
          formData.set('username', formData.get('username').replace(/[+() -]/g, ''))

          // this.changeData(formData).finally(() => {
          btn.classList.remove('_is-edit')
          this.isEdit = false
          this.disableEditInput(this.formClientData)
          // })
        }
      })
    } else {
      btn.classList.add('_is-edit')
      this.isEdit = true
      this.enableEditInput(this.formClientData)
    }
  }

  renderModal({ client, agreements }) {
    this.renderElements = this.modalBody.querySelectorAll('[data-render]')
    this.renderElements.length && this.renderElements.forEach(el => {
      const renderName = el.getAttribute('data-render')
      const value = client[renderName] ? client[renderName] : ''

      if (el.tagName === 'INPUT') {
        if (el.name === 'username') {
          el.value = formatPhoneNumber(value)
        } else if (el.name === 'birthday') {
          el.value = getFormattedDate(value)
          this.validatorClient?.calendarBirthday.setDate(getFormattedDate(value), true, "d.m.Y")
        } else {
          el.value = value
        }
      } else if (el.tagName === 'IMG') {
        el.src = value
      } else if (el.classList.contains('wp-status')) {
        el.classList.remove('confirmed', 'not-confirmed')
        el.classList.add(`${value ? 'confirmed' : 'not-confirmed'}`)
      } else {
        if (renderName === 'user_id' && el.tagName === 'BUTTON') {
          el.setAttribute('data-user-id', client[renderName])
        } else {
          el.textContent = value
        }
      }
    })

    this.contentAgreements = this.modalBody.querySelector('.modal-content-agreements')
    this.contentAgreements.innerHTML = ''
    agreements.length && agreements.forEach(agreement => {
      this.contentAgreements.insertAdjacentElement('beforeend', agreementHtml(agreement))
    })
  }

  enableEditInput(form) {
    if (!form) return
    const inputs = form.querySelectorAll('input')
    inputs.length && inputs.forEach(input => {
      input.removeAttribute('readonly')
      input.classList.add('edit')
      input.classList.remove('not-edit')
    })

    this.validatorClient?.calendarBirthday.set('clickOpens', true)
  }

  disableEditInput(form, arr = []) {
    if (form) {
      const inputs = form.querySelectorAll('input')

      inputs.length && inputs.forEach(input => {
        input.setAttribute('readonly', 'true')
        input.classList.remove('edit')
        input.classList.add('not-edit')
      })

      this.validatorClient?.calendarBirthday.set('clickOpens', false)
    }

    if (arr.length) {
      arr.forEach(obj => obj.el.classList.remove(obj.delClass))
    }
  }

  onClose() {
    this.disableEditInput(this.formClientData, [
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

  async changeData(formData) {
    try {
      this.loader.enable()
      const response = await api.post('/_edit_client_by_client_', formData)
      if (response.status !== 200) return null
      outputInfo(response.data)
      return response.data
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  async onOpen() {
    try {
      this.loader.enable()
      const data = await getClientTotal(this.userId)
      this.renderModal(data)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalClient = new ModalClient();

export default modalClient;