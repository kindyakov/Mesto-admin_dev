import tippy from '../../configs/tippy.js'
import { createElement } from "../../settings/createElement.js"
import { searchModalHtml, itemHtml } from "./html.js"

const defaultOptions = {
	allowHTML: true,
	trigger: 'click',
	maxWidth: 300,
	interactive: true,
	placement: 'bottom-start',
	appendTo: document.body,
}

class SearchLock {
	constructor(el, options = {}) {
		this.el = el;
		this.options = Object.assign({}, defaultOptions, options, {
			onShow: this.onShow.bind(this),
			onHide: this.onHide.bind(this),
		});

		this.tippy = tippy(el, { ...this.options, content: this.content.bind(this) });
		this.locks = [];
		this.filteredLocks = [];
		this.selectedLock = null;
		this.onSelect = () => { };
	}

	content() {
		const wrapper = createElement('div', { classes: ['search-modal'] });
		wrapper.innerHTML = searchModalHtml();
		return wrapper;
	}

	onShow(instance) {
		this.modal = instance.popper.querySelector('.search-modal');
		this.inputSearch = this.modal.querySelector('input[name="search_str"]');
		this.contentContainer = this.modal.querySelector('.search-modal__content');

		this.inputSearch.addEventListener('input', this.handleInput.bind(this));
		this.contentContainer.addEventListener('click', this.handleItemClick.bind(this));

		// Reset filter when opening
		this.filteredLocks = this.locks;
		this.render(this.filteredLocks);

		setTimeout(() => this.inputSearch.focus(), 50);
	}

	onHide() {
		if (this.inputSearch) this.inputSearch.value = '';
	}

	setLocks(locks) {
		this.locks = locks;
		this.filteredLocks = locks;
		if (this.modal) {
			this.render(this.filteredLocks);
		}
	}

	handleInput(e) {
		const value = e.target.value.toLowerCase();
		this.filteredLocks = this.locks.filter(lock =>
			String(lock).toLowerCase().includes(value)
		);
		this.render(this.filteredLocks);
	}

	handleItemClick(e) {
		const item = e.target.closest('.item-lock');
		if (!item) return;

		const id = item.dataset.id;
		const num = item.dataset.num;

		this.selectLock({ lock_id: id, lock_num: num });
	}

	selectLock(lock) {
		this.selectedLock = lock;
		this.el.textContent = `№${lock.lock_num}`;
		this.el.classList.add('_selected');
		this.tippy.hide();
		this.onSelect(lock);
	}

	clear() {
		this.selectedLock = null;
		this.el.textContent = 'Выберите замок';
		this.el.classList.remove('_selected');
		this.locks = [];
	}

	render(locks) {
		if (!this.contentContainer) return;

		if (locks.length) {
			this.contentContainer.innerHTML = locks.map(lock => itemHtml(lock)).join('');
		} else {
			this.contentContainer.innerHTML = `<div class="not-data" style="padding: 10px; text-align: center; color: #999;"><span>Не найдено</span></div>`;
		}
	}
}

export default SearchLock;