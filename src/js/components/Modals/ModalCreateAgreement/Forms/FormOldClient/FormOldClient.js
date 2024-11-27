import { validate } from "./validate.js"
import SearchRoom from "../../../../SearchRoom/SearchRoom.js"

import { dateFormatter } from "../../../../../settings/dateFormatter.js"
import { createElement } from "../../../../../settings/createElement.js"

import { api } from "../../../../../settings/api.js"
import { formNewAgreementByAdmin } from "../../../../../settings/request.js"

import { buildQueryParams } from "../../../../../utils/buildQueryParams.js"


export class FormOldClient {
  constructor(container, loader) {
    this.container = container
    this.loader = loader

    this.form = container.querySelector('.form-old-client')
    this.formElements = Array.from(this.form)
    this.validator = validate(this.form)

    this.selectRoomId = this.form.querySelector('.select-room-id')
    this.searchRoom = new SearchRoom(this.selectRoomId)

    this.inputFio = this.form.querySelector('input[name="fullname"]')
    this.dropdownList = this.form.querySelector('.dropdown-list')

    this.userId = null
    this.fullname = null
    this.timer = null

    this.events()
  }

  events() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this))
    this.inputFio.addEventListener('input', this.handleInput.bind(this))
  }

  handleInput(e) {
    const value = e.target.value.toLowerCase().trim()
    clearTimeout(this.timer)
    if (!value) return

    this.timer = setTimeout(async () => {
      try {
        const data = await this.getFio({ search_str: value })
        if (!data) return

        if (data.users.length) {
          data.users.forEach(({ fullname, user_id }) => {
            const item = createElement('li', { content: fullname })

            item.addEventListener('click', () => {
              this.userId = user_id
              this.fullname = fullname
              e.target.value = fullname
              Array.from(this.dropdownList.children).forEach(el => el.remove())
              this.removeDisabled()
            })

            this.dropdownList.appendChild(item)
          })

        } else {
          window.app.notify.show({ msg: `По запросу "${value}" нечего не найдено`, msg_type: 'warning' })
        }
      } catch (error) {
        throw error
      }
    }, 400)
  }

  handleSubmit() {
    this.validator.revalidate().then(async isValid => {
      try {
        if (!this.searchRoom.selectedRoomIds.length) {
          this.selectRoomId.classList.add('just-validate-error-field')
          this.searchRoom.tippy.show()
          return
        }

        if (!this.userId) {
          window.app.notify.show({ msg: 'Старый клиент не найден, попробуйте ещё раз !', msg_type: 'warning' })
          return
        }

        if (!isValid) return
        this.loader.enable()

        const formData = new FormData(this.form)

        formData.set('agrbegdate', dateFormatter(formData.get('agrbegdate'), 'yyyy-MM-dd'))
        formData.set('agrenddate', dateFormatter(formData.get('agrenddate'), 'yyyy-MM-dd'))
        formData.set('user_id', this.userId)
        formData.set('room_ids', JSON.stringify(this.searchRoom.selectedRoomIds))
        formData.set('old_or_new', 'old')
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

  removeDisabled() {
    this.formElements.length && this.formElements.forEach(el => {
      el.removeAttribute('disabled')
    })
    this.selectRoomId.removeAttribute('disabled')
  }

  addDisabled() {
    this.formElements.length && this.formElements.forEach(el => {
      if (el.name !== 'fullname') {
        el.setAttribute('disabled', true)
      }
    })
    this.selectRoomId.setAttribute('disabled', true)
  }

  reset() {
    this.form.reset()
    this.validator.refresh()
    this.addDisabled()
    this.searchRoom.reset()
    this.userId = null
  }

  async getFio(queryParams) {
    try {
      this.loader.enable()
      const response = await api.get(`/_get_fio_/${buildQueryParams(queryParams)}`)
      if (response.status !== 200) return null
      return response.data
    } catch (error) {
      throw error
    } finally {
      this.loader.disable()
    }
  }
}