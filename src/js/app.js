import Navigation from "./components/Navigation/Naviganion.js";
import Auth from "./components/Auth/Auth.js";

import { useDynamicAdapt } from "./utils/dynamicAdapt.js"

import { Accordion } from "./modules/myAccordion.js"
import { Select } from "./modules/mySelect.js";

import { burger } from "./utils/header.js";

const nav = new Navigation();
const auth = new Auth()

function appInit() {
  nav.init();

  useDynamicAdapt()
  burger({ selectorNav: '.sidebar' })

  new Accordion({ isAccordion: false })
}

if (auth.isAuth) {
  appInit()
}

auth.onAuth = data => appInit()