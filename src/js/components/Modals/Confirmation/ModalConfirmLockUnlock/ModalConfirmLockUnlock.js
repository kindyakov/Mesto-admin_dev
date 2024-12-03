import BaseConfirmationModal from "../BaseConfirmationModal.js"
import { api } from "../../../../settings/api.js"
import { dataStr } from "../../../../utils/dataStr.js"

class ModalConfirmLockUnlock extends BaseConfirmationModal {
  constructor() {
    super('Вы уверены, что</br>хотите заблокировать/разблокировать ячейку?', 'modal-confirm-lock-unlock')

    this.room = null
    this.openModalBtn = null
  }

  onClick(isConfirm) {
    if (isConfirm && this.room) {
      this.blockRoom(this.room)
    }
  }

  onOpen(button) {
    const data = this.extractData(button)

    if (!data) return
    this.openModalBtn = button

    if (data.blocked) {
      this.modalTitle.innerHTML = `Вы уверены, что</br>хотите заблокировать ячейку?`
    } else {
      this.modalTitle.innerHTML = `Вы уверены, что</br>хотите разблокировать ячейку?`
    }

    this.room = data
  }

  onClose() {
    this.room = null
    this.openModalBtn = null
  }

  async blockRoom(data) {
    try {
      this.loader.enable()
      const response = await api.post('/_block_room_', data)
      if (response.status !== 200) return
      window.app.notify.show(response.data)
      if (response.data.msg_type == 'success' && this.openModalBtn) {
        this.openModalBtn.setAttribute('data-blocked', data.blocked)
        this.openModalBtn.setAttribute('data-json', JSON.stringify({ ...data, blocked: data.blocked ? 0 : 1 }))
      }
      this.close()
    } catch (error) {
      window.app.notify.show({ msg_type: 'error', msg: `Непредвиденная ошибка 😓! ${error.message}` })
      console.error(error)
      throw error
    } finally {
      this.loader.disable()
    }
  }
}

const modalConfirmLockUnlock = new ModalConfirmLockUnlock()

export default modalConfirmLockUnlock