import tippy from "tippy.js";

import BaseModal from "../BaseModal.js";
import content from "./content.html"

import { getAgreementTotal } from "../../../settings/request.js";
import { formattingPrice } from "../../../utils/formattingPrice.js";
import { getFormattedDate } from "../../../utils/getFormattedDate.js";
import { validate } from "./validate.js";
import { outputInfo } from "../../../utils/outputinfo.js";
import { api } from "../../../settings/api.js";
import { createElement } from "../../../settings/createElement.js";
import { renderForm } from "../utils/renderForm.js";

class ModalAgreement extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-agreement'],
      ...options
    })

    this.isEdit = false

    this.init()
  }

  init() {
    if (!this.modalBody) return
    this.paymentsList = this.modalBody.querySelector('.payments-list')
    this.returnsList = this.modalBody.querySelector('.returns-list')
    this.contentRooms = this.modalBody.querySelector('.modal-content-rooms')
    this.form = this.modalBody.querySelector('.form-agreement-data')
    this.btnCompleteAgreement = this.modalBody.querySelector('.btn-complete-agreement')
    this.events()
  }

  renderModal({ agreement, rooms, payments, returns }) {
    this.renderElements = this.modalBody.querySelectorAll('[data-render]')
    this.attrsModal = this.modalBody.querySelectorAll('[data-modal]')

    this.attrsModal.length && this.attrsModal.forEach(el => {
      el.setAttribute('data-json', JSON.stringify(agreement))
    })

    this.renderElements.length && this.renderElements.forEach(el => renderForm(el, agreement))

    this.validator = validate(this.form)

    // рендер платежей 
    if (payments.length) {
      this.paymentsList.innerHTML = ''
      payments.forEach(payment => {
        this.paymentsList.insertAdjacentHTML('beforeend', `
          <div class="modal__box_row">
            <span class="table-span-price">${payment.amount ? formattingPrice(payment.amount) : ''}</span>
            <span class="date">${payment.payment_date ? getFormattedDate(payment.payment_date) : ''}</span>
          </div>`
        )
      })
    } else {
      this.paymentsList.innerHTML = `<div class="not-data"><span>Нет платежей для отображения</span></div>`
    }

    // рендер возвратов
    if (returns.length) {
      this.returnsList.innerHTML = ''
      returns.forEach(obj => {
        this.returnsList.insertAdjacentHTML('beforeend', `
          <div class="modal__box_row">
            <span class="table-span-agrid">${obj.amount ? formattingPrice(obj.amount) : ''}</span>
              <span class="date">${obj.payment_date ? getFormattedDate(obj.payment_date) : ''}</span>
          </div>`
        )
      })
    } else {
      this.returnsList.innerHTML = `<div class="not-data"><span>Нет возвратов для отображения</span></div>`
    }

    // рендер ячеек
    if (rooms.length) {
      this.contentRooms.innerHTML = ''
      rooms.forEach(room => {
        const roomData = JSON.stringify(room).replace(/\s+/g, '').replace(/"/g, '&quot;');
        this.contentRooms.insertAdjacentHTML('beforeend', `
          <div class="modal__block_grid-item">
            <span class="item-num">${room.room_id ? '№' + room.room_id : ''}</span>
            <p class="item-info">${room.warehouse_name ? room.warehouse_name : ''}</p>
            <button class="item-more-detailed" data-json="${roomData}" data-modal="modal-room"><span>Подробнее</span></button>
          </div>`
        )
      })
    } else {
      this.contentRooms.innerHTML = `<div class="not-data"><span>Нет ячеек для отображения</span></div>`
    }

    this.confirmationModal = tippy(this.btnCompleteAgreement, {
      allowHTML: true,
      trigger: 'click',
      maxWidth: 450,
      content: (reference) => {
        const confirmation = createElement('div', ['confirmation-modal', 'confirmation-completion-agreement']);
        const confirmationContent = createElement('div', ['confirmation-modal__content'], `
          <h5 class="confirmation-modal__title">Уверены ли Вы что хотите завершить договор?</h5>
          <p class="confirmation-modal__text">Дата завершения договора: <span>${getFormattedDate()}</span></p>
          <!-- <div class="confirmation-modal__rooms"></div> -->
        `);
        // const confirmationRooms = createElement('div', ['confirmation-modal__rooms'])

        // const buttonsRoom = rooms.map((room, i) => {
        //   const btnRoom = createElement('button', ['confirmation-modal__room', 'button', 'transparent'], `
        //     <span>№${room.room_id}</span>`)

        //   if (i == 0) {
        //     this.roomId = room.room_id
        //     btnRoom.classList.remove('transparent')
        //   }

        //   btnRoom.addEventListener('click', () => {
        //     this.roomId = room.room_id
        //     buttonsRoom.forEach(btn => btn.classList.add('transparent'))
        //     btnRoom.classList.remove('transparent')
        //   })

        //   return btnRoom
        // })

        const confirmationFooter = createElement('div', ['confirmation-modal__footer']);
        const btnNo = createElement('button', ['button', 'transparent', 'btn-no'], '<span>Нет</span>');
        const btnYes = createElement('button', ['button', 'btn-yes'], '<span>Да</span>');

        btnNo.addEventListener('click', () => this.handleClickConfirmation(false));
        btnYes.addEventListener('click', () => this.handleClickConfirmation(true));

        // buttonsRoom.forEach(btn => confirmationRooms.appendChild(btn));
        // confirmationContent.append(confirmationRooms)
        confirmationFooter.append(btnNo, btnYes);
        confirmation.append(confirmationContent, confirmationFooter);

        return confirmation;
      },
      duration: 0,
      placement: 'top-end',
      interactive: true,
      appendTo: document.body,
    })
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
          const formData = new FormData(this.form)
          let data = { user_id: this.userId }
          Array.from(formData).forEach(obj => data[obj[0]] = obj[1])

          this.edit(data).finally(() => {
            btn.classList.remove('_is-edit')
            this.isEdit = false
            this.disableEditInput(this.form)
          })
        }
      })
    } else {
      btn.classList.add('_is-edit')
      this.isEdit = true
      this.enableEditInput(this.form)
    }
  }

  handleClickConfirmation(isConfirm) {
    if (isConfirm) {

    }

    this.confirmationModal.hide()
  }

  enableEditInput(form) {
    if (!form) return
    const inputs = form.querySelectorAll('input')
    inputs.length && inputs.forEach(input => {
      input.removeAttribute('readonly')
      input.classList.add('edit')
      input.classList.remove('not-edit')
    })

    this.validator?.calendars.forEach(calendar => calendar.set('clickOpens', true))
  }

  disableEditInput(form, arr = []) {
    if (form) {
      const inputs = form.querySelectorAll('input')

      inputs.length && inputs.forEach(input => {
        input.setAttribute('readonly', 'true')
        input.classList.remove('edit')
        input.classList.add('not-edit')
      })

      this.validator?.calendars.forEach(calendar => calendar.set('clickOpens', false))
    }

    if (arr.length) {
      arr.forEach(obj => obj.el.classList.remove(obj.delClass))
    }
  }

  onClose() {
    this.disableEditInput(this.form, [
      { el: this.modalBody.querySelector('.btn-edit-client-data'), delClass: '_is-edit' }
    ])
    this.confirmationModal.hide()
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

  async edit(data) {
    try {
      this.loader.enable()
      const response = await api.post('/_edit_agreement_', data)
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
      const data = await getAgreementTotal(extractData.agrid)
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

const modalAgreement = new ModalAgreement()

export default modalAgreement