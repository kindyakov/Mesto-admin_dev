import Navigation from "./components/Navigation/Navigation.js";
import Auth from "./components/Auth/Auth.js";
import { initializeModalTriggers } from "./components/initializeModalTriggers.js";

import { Accordion } from "./modules/myAccordion.js"

import { useDynamicAdapt } from "./utils/dynamicAdapt.js"
import { burger } from "./utils/header.js";

import modalAddClient from "./components/Modals/ModalAddClient/ModalAddClient.js";
import modalChangePhotoPassport from "./components/Modals/ModalChangePhotoPassport/ModalChangePhotoPassport.js";
import modalClient from "./components/Modals/ModalClient/ModalClient.js";
import modalOldClient from "./components/Modals/ModalOldClient/ModalOldClient.js";
import modalPassport from "./components/Modals/ModalPassport/ModalPassport.js";
import { outputInfo } from "./utils/outputinfo.js";

const nav = new Navigation();
const auth = new Auth()

const modalMap = {
  [getClassModal(modalAddClient)]: modalAddClient,
  [getClassModal(modalPassport)]: modalPassport,
  [getClassModal(modalChangePhotoPassport)]: modalChangePhotoPassport,
  [getClassModal(modalClient)]: modalClient,
  [getClassModal(modalOldClient)]: modalOldClient,
  [getClassModal(modalPassport)]: modalPassport,
}

let isFirstLoad = false

function appInit() {
  if (!isFirstLoad) {
    useDynamicAdapt()
    burger({ selectorNav: '.sidebar' })
    initializeModalTriggers(modalMap)

    new Accordion({ isAccordion: false })
    nav.init()
  }

  isFirstLoad = true
}

if (auth.isAuth) {
  appInit()
}

auth.onAuth = data => appInit()


function getClassModal({ modal }) {
  return modal.opts.cssClass[0]
}