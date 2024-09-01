import BaseModal from "../BaseModal.js"
import content from './content.html'
import { validate } from "./validate.js";

import { Select } from "../../../modules/mySelect.js";
import { outputInfo } from "../../../utils/outputinfo.js";
import { api } from "../../../settings/api.js";

class ModalCompleteRent extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-complete-rent'],
      ...options
    })

    this.isEdit = false
    this.roomId = null
    this.agrId = null

    this.init()
  }

  init() {
    if (!this.modalBody) return
    this.form = this.modalBody.querySelector('.form-complete-rent')
    this.itemComment = this.modalBody.querySelector('.item-comment')
    this.btn = this.modalBody.querySelector('.btn-complete-rent')

    this.validator = validate(this.form)

    this.selects = new Select({
      uniqueName: 'select-modal-complete-rent', parentEl: this.modalBody,
      onChange: (e, select, optionValue) => {
        if (optionValue == 'Другая') {
          this.itemComment.classList.remove('_none')
        } else {
          this.itemComment.classList.add('_none')
        }
      }
    })

    this.events()
  }

  events() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this))
    this.btn.addEventListener('click', this.handleSubmit.bind(this))
  }

  handleSubmit() {
    this.validator.revalidate().then(isValid => {
      if (!isValid) return
      const formData = new FormData(this.form)
      let data = { room_id: this.roomId, comment: null }

      Array.from(formData).forEach(arr => data[arr[0]] = arr[1])

      this.endRent(data).then(({ msg_type = '' }) => {
        if (msg_type == 'success') {
          this.close()
          const prevModal = window.app.modalMap[this.btnOpenPrevModal.getAttribute('data-modal')]
          prevModal.open([this.agrId, this.roomId])
        }
      }).finally(() => {
        this.validator.refresh()
        this.form.reset()
        this.isEdit = false
      })
    })
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

  renderModal(agrId, roomId) {
    this.attrsModal.length && this.attrsModal.forEach(el => {
      el.setAttribute('room-id', roomId)
      el.setAttribute('agr-id', agrId)
    })
  }

  onOpen(params = null) {
    if (!params) return
    setTimeout(() => {
      this.validator?.calendars.forEach(calendar => calendar.redraw())
    })
    if (params instanceof Element) {
      this.agrId = params.getAttribute('agr-id')
      this.roomId = params.getAttribute('room-id')
    } else {
      [this.agrId, this.roomId] = params
    }

    if (this.agrId) {
      this.renderModal(this.agrId, this.roomId)
    }
  }

  async endRent(data) {
    try {
      this.loader.enable()
      const response = await api.post('/_end_rent_', data)
      if (response.status !== 200) return
      outputInfo(response.data)
      return response.data
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalCompleteRent = new ModalCompleteRent()

export default modalCompleteRent