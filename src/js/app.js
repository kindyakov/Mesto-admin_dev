import Navigation from "./components/Navigation/Navigation.js";
import Auth from "./components/Auth/Auth.js";
import WarehousesSelect from "./components/WarehousesSelect/WarehousesSelect.js";
import { initializeModalTriggers } from "./components/initializeModalTriggers.js";

import { Accordion } from "./modules/myAccordion.js"
import { Notification } from "./modules/myNotification.js";

import { useDynamicAdapt } from "./utils/dynamicAdapt.js"
import { burger, fixedSideBar } from "./utils/header.js";

import { modalMap } from "./modalMap.js";

window.app = {
  warehouses: [],
  warehouse: null,
  modalMap,
  logsModal: []
}

const mainLoader = document.querySelector('.body-loader')
const notify = new Notification()

const auth = new Auth({ modalMap, notify, mainLoader })
const warehousesSelect = new WarehousesSelect({ mainLoader })
const nav = new Navigation();

let isFirstLoad = true

Fancybox.defaults.Hash = false;
window.app.auth = auth
window.app.notify = notify

async function appInit(user) {
  try {
    if (isFirstLoad) {
      useDynamicAdapt()
      fixedSideBar()
      burger({ selectorNav: '.sidebar' })
      initializeModalTriggers(modalMap)
      Fancybox.bind("[data-fancybox]")
      document.querySelector('.header__user_info .name').textContent = user.manager.manager_fullname

      new Accordion({ isAccordion: false })
      await warehousesSelect.render()
    }

    nav.init({ warehouse: window.app.warehouse, notify, user })

    isFirstLoad = false
  } catch (error) {
    console.log(error)
  }
}

if (auth.isAuth) {
  appInit(auth.user)
}

auth.onAuth = user => appInit(user)
