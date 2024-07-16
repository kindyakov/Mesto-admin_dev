import BaseConfirmationModal from "../BaseConfirmationModal.js"
import { api } from "../../../../settings/api.js"
import { outputInfo } from "../../../../utils/outputinfo.js"

class ModalConfirmOpenRoom extends BaseConfirmationModal {
  constructor() {
    super('Уверены ли Вы что</br>хотите открыть ячейку? ', 'modal-confirm-open-room')

    this.room = null
  }

  onClick(isConfirm) {
    if (isConfirm && this.room) {
      this.openRoom(this.room.room_id)
    }
  }

  onOpen(params) {
    const data = this.extractData(params)
    if (data) {
      this.room = data
    }
  }

  onClose() {
    this.room = null
  }

  async openRoom(id) {
    try {
      this.loader.enable()
      const response = await api.post(`/unlock/${id}`)
      if (response.status !== 200) return
      outputInfo(response.data)
      this.close()
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalConfirmOpenRoom = new ModalConfirmOpenRoom()

export default modalConfirmOpenRoom