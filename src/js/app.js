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


const sidebarContent = document.querySelector('.sidebar-content')

if (sidebarContent && window.innerWidth > 1200) {
  const wrapper = sidebarContent.parentElement;
  const paddingTop = 20
  const topRect = sidebarContent.getBoundingClientRect().top
  let isFixed = false;

  window.addEventListener('scroll', e => {
    if (window.innerWidth < 1200) return
    const rect = sidebarContent.getBoundingClientRect();
    const parentRect = wrapper.getBoundingClientRect();

    if (!isFixed && window.scrollY + paddingTop >= topRect && parentRect.bottom - rect.height >= paddingTop) {
      sidebarContent.style.cssText = `position: fixed; top: ${paddingTop}px; left: ${rect.left}px; max-width: ${rect.width}px;`
      isFixed = true;
    } else if (isFixed && window.scrollY + paddingTop <= topRect) {
      sidebarContent.removeAttribute('style')
      isFixed = false;
    } else if (isFixed && parentRect.bottom - rect.height <= paddingTop) {
      sidebarContent.style.cssText = `position: absolute; bottom: 0; left: 0; max-width: ${rect.width}px;`
      isFixed = false;
    }
  })
}

if (false && window.innerWidth > 100) {
  const wrapper = slideEstablish.parentElement;
  const header = document.querySelector('.header')
  let isFixed = false;

  window.addEventListener('scroll', e => {
    if (window.innerWidth < 1500) return
    const rect = slideEstablish.getBoundingClientRect();
    const parentRect = wrapper.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    const paddingTop = headerRect.height + 20

    if (!isFixed && parentRect.top <= paddingTop && parentRect.bottom - rect.height >= paddingTop) {
      slideEstablish.style.cssText = `position: fixed; top: ${paddingTop}px; left: ${parentRect.left}px; max-width: ${wrapper.clientWidth}px;`
      isFixed = true;
    } else if (isFixed && parentRect.top >= paddingTop) {
      slideEstablish.removeAttribute('style')
      isFixed = false;
    } else if (isFixed && parentRect.bottom - rect.height <= paddingTop) {
      slideEstablish.style.cssText = `position: absolute; bottom: 0; left: 0; max-width: ${wrapper.clientWidth}px;`
      isFixed = false;
    }
  });
}