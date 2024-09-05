import BaseConfirmationModal from "../BaseConfirmationModal.js"
import { formattingPrice } from "../../../../utils/formattingPrice.js"

class ModalConfirmationDepartureRoom extends BaseConfirmationModal {
  constructor() {
    super('Вы уверены, что</br>хотите подтвердить возврат, сейчас сумма к возврату <span class="price"></span>?', 'modal-confirmation-departure-room')
    this.price = this.modalBody.querySelector('.price')
  }

  changePrice(price) {
    this.price.textContent = formattingPrice(price)
  }

  onClick(isConfirm) {

  }
}

const modalConfirmationDepartureRoom = new ModalConfirmationDepartureRoom()
export default modalConfirmationDepartureRoom