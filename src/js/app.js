import Navigation from "./components/Navigation/Navigation.js";
import Auth from "./components/Auth/Auth.js";
import WarehousesSelect from "./components/WarehousesSelect/WarehousesSelect.js";
import { initializeModalTriggers } from "./components/initializeModalTriggers.js";

import { Accordion } from "./modules/myAccordion.js"

import { useDynamicAdapt } from "./utils/dynamicAdapt.js"
import { burger, fixedSideBar } from "./utils/header.js";

import { modalMap } from "./modalMap.js";

window.app = {
  warehouses: [],
  warehouse: null
}

const nav = new Navigation();
const auth = new Auth({ modalMap })
const warehousesSelect = new WarehousesSelect()

let isFirstLoad = true

Fancybox.defaults.Hash = false;

function appInit(user) {
  if (isFirstLoad) {
    useDynamicAdapt()
    fixedSideBar()
    burger({ selectorNav: '.sidebar' })
    initializeModalTriggers(modalMap)
    Fancybox.bind("[data-fancybox]")

    new Accordion({ isAccordion: false })
    warehousesSelect.render().then(warehouse => {
      nav.init(warehouse)
    })
  }

  isFirstLoad = false
}

if (auth.isAuth) {
  appInit(auth.user)
}

auth.onAuth = user => appInit(user)