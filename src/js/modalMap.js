import modalAddClient from "./components/Modals/ModalAddClient/ModalAddClient.js";
import modalChangePhotoPassport from "./components/Modals/ModalChangePhotoPassport/ModalChangePhotoPassport.js";
import modalClient from "./components/Modals/ModalClient/ModalClient.js";
import modalOldClient from "./components/Modals/ModalOldClient/ModalOldClient.js";
import modalPassport from "./components/Modals/ModalPassport/ModalPassport.js";
import modalAgreement from "./components/Modals/ModalAgreement/ModalAgreement.js";
import modalAddPayment from "./components/Modals/ModalAddPayment/ModalAddPayment.js";
import modalRoom from "./components/Modals/ModalRoom/ModalRoom.js";
import modalFinancialInformation from "./components/Modals/ModalFinancialInformation/ModalFinancialInformation.js";
import modalCompleteRent from "./components/Modals/ModalCompleteRent/ModalCompleteRent.js";
import modalBookRoom from "./components/Modals/ModalBookRoom/ModalBookRoom.js";
import modalGetGuestAccess from "./components/Modals/ModalGetGuestAccess/ModalGetGuestAccess.js";
import modalCreatePersonalAccount from "./components/Modals/ModalCreatePersonalAccount/ModalCreatePersonalAccount.js";
import modalConfirmationDeparture from "./components/Modals/ModalConfirmationDeparture/ModalConfirmationDeparture.js";
import modalCreateAgreement from "./components/Modals/ModalCreateAgreement/ModalCreateAgreement.js";
import modalDownloadPhotoWh from "./components/Modals/ModalDownloadPhotoWh/ModalDownloadPhotoWh.js";
import modalShowPhotoWh from "./components/Modals/ModalShowPhotoWh/ModalShowPhotoWh.js";
import modalConfirmationClient from "./components/Modals/ModalConfirmationClient/ModalConfirmationClient.js";
import modalPhotoRoom from "./components/Modals/ModalPhotoRoom/ModalPhotoRoom.js";
import modalSelectNextPayment from "./components/Modals/ModalSelectNextPayment/ModalSelectNextPayment.js";

import modalConfirmOpenRoom from "./components/Modals/Confirmation/ModalConfirmOpenRoom/ModalConfirmOpenRoom.js";

function getClassModal({ modal }) {
  return modal.opts.cssClass[0]
}

export const modalMap = {
  [getClassModal(modalAddClient)]: modalAddClient, // 
  [getClassModal(modalPassport)]: modalPassport, // Паспорт
  [getClassModal(modalChangePhotoPassport)]: modalChangePhotoPassport, // Загрузка фото паспорта
  [getClassModal(modalClient)]: modalClient, // Клиент
  [getClassModal(modalOldClient)]: modalOldClient, // Старый клиент
  [getClassModal(modalPassport)]: modalPassport, // Паспорт
  [getClassModal(modalAgreement)]: modalAgreement,
  [getClassModal(modalAddPayment)]: modalAddPayment,
  [getClassModal(modalRoom)]: modalRoom,
  [getClassModal(modalFinancialInformation)]: modalFinancialInformation,
  [getClassModal(modalCompleteRent)]: modalCompleteRent,
  [getClassModal(modalBookRoom)]: modalBookRoom,
  [getClassModal(modalGetGuestAccess)]: modalGetGuestAccess,
  [getClassModal(modalCreatePersonalAccount)]: modalCreatePersonalAccount,
  [getClassModal(modalConfirmationDeparture)]: modalConfirmationDeparture,
  [getClassModal(modalCreateAgreement)]: modalCreateAgreement,
  [getClassModal(modalDownloadPhotoWh)]: modalDownloadPhotoWh,
  [getClassModal(modalShowPhotoWh)]: modalShowPhotoWh,
  [getClassModal(modalConfirmationClient)]: modalConfirmationClient,
  [getClassModal(modalConfirmOpenRoom)]: modalConfirmOpenRoom,
  [getClassModal(modalPhotoRoom)]: modalPhotoRoom,
  [getClassModal(modalSelectNextPayment)]: modalSelectNextPayment,
}