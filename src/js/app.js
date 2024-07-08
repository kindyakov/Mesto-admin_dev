import Navigation from "./components/Navigation/Naviganion.js";
import Auth from "./components/Auth/Auth.js";

import flatpickr from "flatpickr";
import { Russian } from "flatpickr/dist/l10n/ru.js"

import { useDynamicAdapt } from "./utils/dynamicAdapt.js"

import { Accordion } from "./modules/myAccordion.js"
import { Select } from "./modules/mySelect.js";

import { burger } from "./utils/header.js";

import { createCalendar } from "./components/createCalendar.js";

const nav = new Navigation();
const auth = new Auth()

function appInit() {
  nav.init();

  useDynamicAdapt()
  burger({ selectorNav: '.sidebar' })

  new Accordion()
  new Select()
}

if (auth.isAuth) {
  appInit()
}

auth.onAuth = data => appInit()

const selectFilter = new Select({ uniqueName: 'select-filter-main' })
const calendars = createCalendar(".input-date-filter", {
  mode: "range",
  dateFormat: "d. M, Y",
})