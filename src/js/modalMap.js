import modalAddClient from './components/Modals/ModalAddClient/ModalAddClient.js';
import modalChangePhotoPassport from './components/Modals/ModalChangePhotoPassport/ModalChangePhotoPassport.js';
import modalClient from './components/Modals/ModalClient/ModalClient.js';
// import modalClientConfirmation from "./components/Modals/ModalClientConfirmation/ModalClientConfirmation.js";
import modalOldClient from './components/Modals/ModalOldClient/ModalOldClient.js';
import modalPassport from './components/Modals/ModalPassport/ModalPassport.js';
import modalAgreement from './components/Modals/ModalAgreement/ModalAgreement.js';
import modalAddPayment from './components/Modals/ModalAddPayment/ModalAddPayment.js';
import modalAddRefund from './components/Modals/ModalAddRefund/ModalAddRefund.js';
import modalRoom from './components/Modals/ModalRoom/ModalRoom.js';
import modalFinancialInformation from './components/Modals/ModalFinancialInformation/ModalFinancialInformation.js';
import modalCompleteRent from './components/Modals/ModalCompleteRent/ModalCompleteRent.js';
import modalBookRoom from './components/Modals/ModalBookRoom/ModalBookRoom.js';
import modalGetGuestAccess from './components/Modals/ModalGetGuestAccess/ModalGetGuestAccess.js';
import modalCreatePersonalAccount from './components/Modals/ModalCreatePersonalAccount/ModalCreatePersonalAccount.js';
import modalConfirmationDeparture from './components/Modals/ModalConfirmationDeparture/ModalConfirmationDeparture.js';
import modalSendLinkCreateAgreement from './components/Modals/ModalSendLinkCreateAgreement/ModalSendLinkCreateAgreement.js';
import modalDownloadPhotoWh from './components/Modals/ModalDownloadPhotoWh/ModalDownloadPhotoWh.js';
import modalShowPhotoWh from './components/Modals/ModalShowPhotoWh/ModalShowPhotoWh.js';
import modalPhotoRoom from './components/Modals/ModalPhotoRoom/ModalPhotoRoom.js';
import modalSelectNextPayment from './components/Modals/ModalSelectNextPayment/ModalSelectNextPayment.js';
import modalCreateAgreement from './components/Modals/ModalCreateAgreement/ModalCreateAgreement.js';
import modalCreateOperation from './components/Modals/ModalCreateOperation/ModalCreateOperation.js';
import modalAddPromoCode from './components/Modals/ModalAddPromoCode/ModalAddPromoCode.js';

import modalConfirmOpenRoom from './components/Modals/Confirmation/ModalConfirmOpenRoom/ModalConfirmOpenRoom.js';
import modalConfirmCancelGuestAccess from './components/Modals/Confirmation/ModalConfirmCancelGuestAccess/ModalConfirmCancelGuestAccess.js';
import modalConfirmationDepartureRoom from './components/Modals/Confirmation/ModalConfirmationDepartureRoom/ModalConfirmationDepartureRoom.js';
import modalConfirmLockUnlock from './components/Modals/Confirmation/ModalConfirmLockUnlock/ModalConfirmLockUnlock.js';
import modalConfirmCancelPayment from './components/Modals/Confirmation/ModalConfirmCancelPayment/ModalConfirmCancelPayment.js';

function getClassModal({ modal }) {
	return modal.opts.cssClass[0];
}

export const modalMap = {
	[getClassModal(modalAddClient)]: modalAddClient, //
	[getClassModal(modalPassport)]: modalPassport, // Паспорт
	[getClassModal(modalChangePhotoPassport)]: modalChangePhotoPassport, // Загрузка фото паспорта
	[getClassModal(modalClient)]: modalClient, // Клиент
	// [getClassModal(modalClientConfirmation)]: modalClientConfirmation,
	[getClassModal(modalOldClient)]: modalOldClient, // Старый клиент
	[getClassModal(modalPassport)]: modalPassport, // Паспорт
	[getClassModal(modalAgreement)]: modalAgreement,
	[getClassModal(modalAddPayment)]: modalAddPayment,
	[getClassModal(modalAddRefund)]: modalAddRefund,
	[getClassModal(modalRoom)]: modalRoom,
	[getClassModal(modalFinancialInformation)]: modalFinancialInformation,
	[getClassModal(modalCompleteRent)]: modalCompleteRent,
	[getClassModal(modalBookRoom)]: modalBookRoom,
	[getClassModal(modalGetGuestAccess)]: modalGetGuestAccess,
	[getClassModal(modalCreatePersonalAccount)]: modalCreatePersonalAccount,
	[getClassModal(modalConfirmationDeparture)]: modalConfirmationDeparture,
	[getClassModal(modalSendLinkCreateAgreement)]: modalSendLinkCreateAgreement,
	[getClassModal(modalDownloadPhotoWh)]: modalDownloadPhotoWh,
	[getClassModal(modalShowPhotoWh)]: modalShowPhotoWh,
	[getClassModal(modalPhotoRoom)]: modalPhotoRoom,
	[getClassModal(modalSelectNextPayment)]: modalSelectNextPayment,
	[getClassModal(modalCreateAgreement)]: modalCreateAgreement,
	[getClassModal(modalCreateOperation)]: modalCreateOperation,
	[getClassModal(modalAddPromoCode)]: modalAddPromoCode,
	// Окна с подтверждением
	[getClassModal(modalConfirmOpenRoom)]: modalConfirmOpenRoom,
	[getClassModal(modalConfirmCancelGuestAccess)]: modalConfirmCancelGuestAccess,
	[getClassModal(modalConfirmationDepartureRoom)]: modalConfirmationDepartureRoom,
	[getClassModal(modalConfirmLockUnlock)]: modalConfirmLockUnlock,
	[getClassModal(modalConfirmCancelPayment)]: modalConfirmCancelPayment
};
