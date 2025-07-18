import Navigation from './components/Navigation/Navigation.js';
import Auth from './components/Auth/Auth.js';
import WarehousesSelect from './components/WarehousesSelect/WarehousesSelect.js';
import { initializeModalTriggers } from './components/initializeModalTriggers.js';

import { Accordion } from './modules/myAccordion.js';
import { Notification } from './modules/myNotification.js';

import { useDynamicAdapt } from './utils/dynamicAdapt.js';
import { burger, fixedSideBar } from './utils/header.js';

import { modalMap } from './modalMap.js';

window.app = {
	logsModal: [],
	warehouses: [],
	modalMap,
	warehouse: null,
};

const mainLoader = document.querySelector('.body-loader');
const notify = new Notification();
const auth = new Auth({ modalMap, notify, mainLoader });
const warehousesSelect = new WarehousesSelect({ mainLoader });
const nav = new Navigation();

let isFirstLoad = true;

Fancybox.defaults.Hash = false;
window.app.auth = auth;
window.app.notify = notify;

async function appInit(user) {
	try {
		if (isFirstLoad) {
			useDynamicAdapt();
			fixedSideBar();
			burger({ selectorNav: '.sidebar' });
			initializeModalTriggers(modalMap);
			Fancybox.bind('[data-fancybox]');

			new Accordion({ isAccordion: false });
			await warehousesSelect.render();
		}

		document.querySelector('.header__user_info .name').textContent = user.manager.manager_fullname;
		nav.init({ warehouse: window.app.warehouse, notify, user });

		const sidebarItemOpen = document.querySelector('.sidebar__item[data-path="open"]')
		sidebarItemOpen.classList.toggle('_none', !window.app.warehouse.warehouse_id)

		isFirstLoad = false;
	} catch (error) {
		console.log(error);
	}
}

if (auth.isAuth) {
	appInit(auth.user);
}

auth.onAuth = user => appInit(user);

window.auth = auth;
window.warehousesSelect = warehousesSelect;
window.nav = nav;
window.notify = notify;