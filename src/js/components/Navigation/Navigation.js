import { Loader } from '../../modules/myLoader.js';
import { Accordion } from '../../modules/myAccordion.js';
import { pages } from '../../configs/pages.js';

class Navigation {
	constructor() {
		this.navLinks = document.querySelectorAll('[data-path]');
		this.contents = document.querySelectorAll('.content-main');

		this.loader = new Loader(document.querySelector('.main'), {
			customSelector: '_main-loader'
		});
		this.sidebarAccordion = new Accordion({ uniqueName: 'sidebar-accordion' });
		this.modulesCache = {}; // Добавляем кэш для загруженных модулей
		this.md1200 = window.matchMedia(`(max-width: 1200px)`);

		this.defaultPage = Object.keys(pages).filter(key => key == 'rooms');

		// Добавляем обработчики событий на ссылки навигации
		this.navLinks.forEach(link => {
			link.addEventListener('click', this.navigate.bind(this));
		});

		// Обработка событий изменения состояния истории
		window.addEventListener('hashchange', this.handleHashChange.bind(this));
	}

	async init({ warehouse, notify, user }) {
		this.warehouse = warehouse;
		this.notify = notify;
		this.user = user;

		Object.keys(pages).forEach(page => {
			pages[page]?.accessCheck({
				tab: this.getTab(page),
				content: this.getContent(page),
				user: this.user
			});
		});

		// Загружаем контент в зависимости от текущего URL при первой загрузке страницы
		const initialPath = window.location.hash.slice(1);

		if (initialPath) {
			this.loadContent(initialPath);
		} else {
			window.location.hash = this.defaultPage.at(0);
		}
	}

	getTab(path) {
		let [tab = null] = Array.from(this.navLinks).filter(link => link.dataset.path == path);
		return tab;
	}

	getContent(path) {
		let [content = null] = Array.from(this.contents).filter(content => content.dataset.content == path);
		return content;
	}

	closeSideBar() {
		const body = document.body;
		const sidebar = document.querySelector('.sidebar');
		const main = document.querySelector('.main');
		const headerBurger = document.querySelector('.header-burger');

		if (this.md1200.matches) {
			body && body.classList.remove('_lock');
			sidebar && sidebar.classList.remove('_active');
			main && main.classList.remove('_shadow');
			headerBurger && headerBurger.classList.remove('_active');
		}
	}

	navigate(e) {
		const path = e.target.closest('[data-path]').getAttribute('data-path');

		if (path) {
			window.location.hash = path;
		}

		this.closeSideBar();
	}

	handleHashChange() {
		const path = window.location.hash.slice(1);
		this.loadContent(path);
	}

	/**
	 * Проверяет права доступа к странице
	 * @param {string} pageName - Имя страницы
	 * @returns {boolean} - Есть ли доступ к странице
	 */
	checkPageAccess(pageName) {
		const path = pages[pageName].path;
		const tab = this.getTab(pageName);
		const content = this.getContent(pageName);

		const isAccess = pages[pageName].accessCheck({
			tab,
			content,
			user: this.user,
			page: this.modulesCache[pageName] || null
		});

		if (!isAccess) {
			window.location.hash = this.defaultPage.at(0);
			return false;
		}

		return true;
	}

	changeTitlePage(pageName) {
		const tab = document.querySelector(`[data-path="${pageName}"]`);
		if (!tab) return;

		const parent = tab.closest('._my-accordion');
		const span = tab.querySelector('span');
		let parentText = '';
		if (parent) {
			parentText = parent.querySelector('._my-accordion-control span')?.textContent || '';
		}

		document.title = (parentText ? parentText + ' / ' : '') + span?.textContent || '';
	}

	loadContent(pageName) {
		if (!pages[pageName]) {
			console.error('Страница не найдена', pageName);
			return;
		}

		const path = pages[pageName].path;

		this.changeTitlePage(pageName);

		if (!this.checkPageAccess(pageName)) {
			return;
		}

		this.loader.enable();
		this.switchingTabs(pageName);

		if (this.modulesCache[pageName]) {
			// Если модуль уже загружен, вызываем только render
			this.loader.disable();
			this.modulesCache[pageName].render();
		} else {
			// Загружаем модуль и сохраняем его в кэш
			import(`../../pages/${path}`)
				.then(module => {
					this.loader.disable();

					const page = new module.default({
						loader: this.loader,
						warehouse: this.warehouse,
						notify: this.notify,
						user: this.user
					});

					this.modulesCache[pageName] = page; // Сохраняем модуль в кэш
					page.render();
				})
				.catch(error => {
					console.error('Ошибка загрузки модуля:', error);
				});
		}
	}

	switchingTabs(path) {
		this.contents.forEach(content => {
			const attr = content.getAttribute('data-content');
			const link = document.querySelector(`[data-path="${attr}"]`);

			if (attr === path) {
				content.classList.add('_active');
				link.classList.add('_active');

				const accordion = link.closest('._my-accordion:not(._open)');
				if (accordion) {
					this.sidebarAccordion.open(accordion);
				}
			} else {
				content?.classList.remove('_active');
				link?.classList.remove('_active');
			}
		});
	}
}

export default Navigation;
