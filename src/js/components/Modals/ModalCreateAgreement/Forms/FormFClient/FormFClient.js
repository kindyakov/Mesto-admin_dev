import { validate } from "./validate.js"
import SearchRoom from "../../../../SearchRoom/SearchRoom.js"

import { dateFormatter } from "../../../../../settings/dateFormatter.js"
import { formNewAgreementByAdmin } from "../../../../../settings/request.js"

export class FormFClient {
  constructor(container, loader) {
    this.container = container
    this.loader = loader

    this.form = container.querySelector('.form-f-client')
    this.formElements = Array.from(this.form)
    this.validator = validate(this.form)

    this.selectRoomId = this.form.querySelector('.select-room-id')
    this.searchRoom = new SearchRoom(this.selectRoomId)

    this.events()
  }

  events() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this))
  }

  handleSubmit() {
    this.validator.revalidate().then(async isValid => {
      try {
        if (!this.searchRoom.selectedRoomIds.length) {
          this.selectRoomId.classList.add('just-validate-error-field')
          this.searchRoom.tippy.show()
          return
        }

        if (!isValid) return
        this.loader.enable()

        const formData = new FormData(this.form)

        formData.set('agrbegdate', dateFormatter(formData.get('agrbegdate'), 'yyyy-MM-dd'))
        formData.set('birthday', dateFormatter(formData.get('birthday'), 'yyyy-MM-dd'))
        formData.set('issue_date', dateFormatter(formData.get('issue_date'), 'yyyy-MM-dd'))
        formData.set('username', formData.get('username').replace(/[+() -]/g, ''))
        formData.set('room_ids', JSON.stringify(this.searchRoom.selectedRoomIds))
        formData.set('user_type', 'f')
        formData.set('old_or_new', 'new')
        formData.delete('flatpickr-month')

        const response = await formNewAgreementByAdmin(formData)
        if (response.status !== 200) return
        window.app.notify.show(response.data)
      } catch (error) {
        throw error
      } finally {
        this.loader.disable()
      }
    })
  }

  reset() {
    this.form.reset()
    this.validator.refresh()
    this.searchRoom.reset()
  }
}