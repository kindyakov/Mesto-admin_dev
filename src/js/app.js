import Navigation from "./components/Navigation/Navigation.js";
import Auth from "./components/Auth/Auth.js";
import { initializeModalTriggers } from "./components/initializeModalTriggers.js";

import { Accordion } from "./modules/myAccordion.js"

import { useDynamicAdapt } from "./utils/dynamicAdapt.js"
import { burger } from "./utils/header.js";

import { modalMap } from "./modalMap.js";

const nav = new Navigation();
const auth = new Auth({ modalMap })

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