class CategoryHeader {
	init(params) {
		this.params = params;
		this.category = params?.category;
		this.expanded = !!params?.expanded;
		this.onToggle = params?.onToggle;

		this.eGui = document.createElement('div');
		this.eGui.className = 'max-w-full flex items-center justify-between gap-2 text-sm font-medium text-gray-800';
		this.eGui.style.maxWidth = '100%';
		const title = document.createElement('span');
		title.className = 'truncate';
		title.title = params?.displayName || params?.colDef?.headerName || '';
		title.textContent = params?.displayName || params?.colDef?.headerName || '';

		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'table-button-header-category';
		btn.setAttribute('aria-label', 'Показать подкатегории');
		btn.textContent = this.expanded ? '−' : '+';
		btn.addEventListener('click', e => {
			e.stopPropagation();
			this.onToggle?.(this.category);
		});

		this.btn = btn;
		this.eGui.prepend(btn, title);
	}

	getGui() {
		return this.eGui;
	}

	refresh(params) {
		this.expanded = !!params?.expanded;
		if (this.btn) {
			this.btn.textContent = this.expanded ? '−' : '+';
		}
		return true;
	}

	destroy() {
		if (this.btn) {
			this.btn.replaceWith(this.btn.cloneNode(true));
		}
	}
}

export default CategoryHeader;

