import BaseModal from "../BaseModal.js";
import content from './content.html'

import { agreementHtml } from "./html.js";
import { validateClient } from "./validate.js";

import { getClientTotal } from "../../../settings/request.js";
import { api } from "../../../settings/api.js";
import { outputInfo } from "../../../utils/outputinfo.js";
import { renderForm } from "../utils/renderForm.js";
import { dateFormatter } from "../../../settings/dateFormatter.js";

class ModalClient extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-client'],
      ...options
    })
    this.userId = null

    this.init()
  }

  init() {
    if (!this.modalBody) return
    this.form = this.modalBody.querySelector('.form-client-data')
    this.validator = validateClient(this.form)
  }

  onEdit() {
    const formData = new FormData(this.form)
    let data = { user_id: this.userId }

    formData.set('birthday', dateFormatter(formData.get('birthday'), 'yyyy-MM-dd'))
    formData.set('username', formData.get('username').replace(/[+() -]/g, ''))
    formData.delete('flatpickr-month')

    Array.from(formData).forEach(obj => data[obj[0]] = obj[1])

    return { client: data }
  }

  renderModal({ client, agreements }) {
    this.renderElements = this.modalBody.querySelectorAll('[data-render]')
    this.attrsModal = this.modalBody.querySelectorAll('[data-modal]')

    this.attrsModal.length && this.attrsModal.forEach(el => {
      el.setAttribute('user-id', client.user_id)
    })

    this.userId = client.user_id

    this.renderElements.length && this.renderElements.forEach(el => renderForm(el, client))

    this.contentAgreements = this.modalBody.querySelector('.modal-content-agreements')
    this.contentAgreements.innerHTML = ''
    agreements.length && agreements.forEach(agreement => {
      this.contentAgreements.insertAdjacentElement('beforeend', agreementHtml(agreement))
    })
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
        this.data = data
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalClient = new ModalClient();

export default modalClient;