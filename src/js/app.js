import Navigation from "./components/Navigation/Naviganion.js";
import Auth from "./components/Auth/Auth.js";

import flatpickr from "flatpickr";
import { Russian } from "flatpickr/dist/l10n/ru.js"

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

  new Accordion()
  new Select()
}

if (auth.isAuth) {
  appInit()
}

auth.onAuth = data => appInit()

const selectFilter = new Select({ uniqueName: 'select-filter-main' })

const calendars = flatpickr(".input-date-filter", {
  mode: "range",
  dateFormat: "d. M, Y",
  "locale": Russian,

  onReady: (selectedDates, dateStr, instance) => {
    const selectM = instance.calendarContainer.querySelector('.flatpickr-monthDropdown-months')
    selectM.classList.add('init-custom-select')
    selectM.setAttribute('name', 'flatpickr-month')
    selectM.setAttribute('data-select-min-width', 'false')
    selectM.setAttribute('data-special-select', 'select-flatpickr')
    selectM.setAttribute('data-input-html', '<svg class="icon icon-arrow"><use xlink:href="./img/svg/sprite.svg#arrow"></use></svg>')

    const customSelect = new Select({
      uniqueName: 'select-flatpickr',
      onChange: (e, select, optionValue) => instance.changeMonth(parseInt(optionValue), false)
    })
  }
})

