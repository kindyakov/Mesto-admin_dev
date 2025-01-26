import BaseConfirmationModal from '../BaseConfirmationModal.js';
import { api } from '../../../../settings/api.js';
import { outputInfo } from '../../../../utils/outputinfo.js';

class ModalConfirmCancelPayment extends BaseConfirmationModal {
	constructor() {
		super('Вы уверены, что</br>хотите отменить оплату?', 'modal-confirm-cancel-payment');

		this.room = null;
	}

	onClick(isConfirm) {
		console.log(isConfirm, this.room);

		if (isConfirm && this.room) {
			this.cancelPayment({
				room_id: this.room.room_id,
				user_id: this.room.user_id,
				agrid: this.room.agrid
			});
		}
	}

	onOpen(params) {
		const data = this.extractData(params);
		console.log(data);

		if (data) {
			this.room = data;
		}
	}

	onClose() {
		this.room = null;
	}

	async cancelPayment(data) {
		try {
			this.loader.enable();
			const response = await api.post('/_cancel_pay_before_agreement_', data);
			if (response.status !== 200) return;
			outputInfo(response.data);
			this.close();
		} catch (error) {
			console.error(error);
		} finally {
			this.loader.disable();
		}
	}
}

const modalConfirmCancelPayment = new ModalConfirmCancelPayment();

export default modalConfirmCancelPayment;
