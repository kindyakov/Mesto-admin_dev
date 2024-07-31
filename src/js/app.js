import Navigation from "./components/Navigation/Navigation.js";
import Auth from "./components/Auth/Auth.js";
import WarehousesSelect from "./components/WarehousesSelect/WarehousesSelect.js";
import { initializeModalTriggers } from "./components/initializeModalTriggers.js";

import { Accordion } from "./modules/myAccordion.js"

import { useDynamicAdapt } from "./utils/dynamicAdapt.js"
import { burger } from "./utils/header.js";

import { modalMap } from "./modalMap.js";

const nav = new Navigation();
const auth = new Auth({ modalMap })
const warehousesSelect = new WarehousesSelect()

let isFirstLoad = true

Fancybox.defaults.Hash = false;

function appInit() {
  if (isFirstLoad) {
    useDynamicAdapt()
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
  appInit()
}

auth.onAuth = data => appInit()