import BaseModal from "../BaseModal.js";
import content from './content.html'
import { validatePassport } from "./validate.js";

import { Select } from '../../../modules/mySelect.js'

import { getClientTotal } from "../../../settings/request.js";
import { api } from "../../../settings/api.js";

import { dateFormatter } from "../../../settings/dateFormatter.js";
import { outputInfo } from "../../../utils/outputinfo.js";
import { renderForm } from "../utils/renderForm.js";

class ModalPassport extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-passport'],
      ...options
    })

    this.selects = new Select({
      uniqueName: 'select-passport',
      disable: true,
      callbackInput: (optionContent, optionValue, select) => {
        return `<svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-yes"><path d="M1 6L5.66667 10.5L15 1.5" stroke="#0B704E" stroke-width="2"/></svg><svg width="16" height="13" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-no"><path d="M1 9L9 1M9 9L1 1" stroke="#D42424" stroke-width="1.5" /></svg><span>${optionContent}</span><svg class='icon icon-arrow'><use xlink:href='img/svg/sprite.svg#arrow'></use></svg>`
      },
      callbackOption: (optionContent, optionValue) => {
        return `${optionValue === '0'
          ? `<svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6.5" r="5" fill="#DC3545" stroke="white" stroke-width="2" /></svg>`
          : `<svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6.5" r="5" fill="#11B880" stroke="white" stroke-width="2" /></svg>`}
        <span>${optionContent}</span>`
      }
    })
    this.init()
  }

  init() {
    if (!this.modalBody) return
    this.form = this.modalBody.querySelector('.form-passport-data')
    this.validator = validatePassport(this.form)
  }

  onEdit() {
    const formData = new FormData(this.form)
    let data = { user_id: this.userId }

    formData.set('issue_date', dateFormatter(formData.get('issue_date'), 'yyyy-MM-dd'))
    formData.delete('flatpickr-month')

    Array.from(formData).forEach(obj => data[obj[0]] = obj[1])

    return { client: data }
  }

  renderModal({ client }) {
    this.renderElements = this.modalBody.querySelectorAll('[data-render]')
    this.attrsModal = this.modalBody.querySelectorAll('[data-modal]')

    this.attrsModal.length && this.attrsModal.forEach(el => {
      el.setAttribute('data-json', JSON.stringify(client))
    })

    this.userId = client.user_id

    this.renderElements.length && this.renderElements.forEach(el => renderForm(el, client))

    this.selects.setValue(client.approved)
  }

  async editForm(data) {
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
      let user_id = ''

      if (params instanceof Element) {
        user_id = params.getAttribute('user-id')
      } else {
        user_id = params
      }

      if (!user_id) return
      const data = await getClientTotal(user_id + '/')
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