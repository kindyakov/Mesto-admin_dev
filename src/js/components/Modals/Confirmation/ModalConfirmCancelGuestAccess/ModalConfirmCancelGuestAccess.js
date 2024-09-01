import BaseConfirmationModal from "../BaseConfirmationModal.js"
import { api } from "../../../../settings/api.js"
import { outputInfo } from "../../../../utils/outputinfo.js"

class ModalConfirmCancelGuestAccess extends BaseConfirmationModal {
  constructor() {
    super('Вы уверены, что</br>хотите отменить гостевой доступ?', 'modal-confirm-cancel-guest-access')

    this.room = null
  }

  onClick(isConfirm) {
    if (isConfirm && this.room) {
      this.cancelRoomTest({ room_id: this.room.room_id, user_id: this.room.user_id })
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

  async cancelRoomTest(data) {
    try {
      this.loader.enable()
      const response = await api.post('/_cancel_room_test_', data)
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

const modalConfirmCancelGuestAccess = new ModalConfirmCancelGuestAccess()

export default modalConfirmCancelGuestAccess