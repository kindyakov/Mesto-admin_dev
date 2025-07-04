import Page from '../Page.js';
import TableLocks from '../../components/Tables/TableLocks/TableLocks.js';
import Pagination from '../../components/Pagination/Pagination.js';
import { mergeQueryParams } from '../../utils/buildQueryParams.js';
// import FilterLocks from "../../components/Filters/FilterLocks/FilterLocks.js";
import { getLocksPower, getScheme } from '../../settings/request.js';
import { Select } from '../../modules/mySelect.js';
import { cardHtml } from './html.js';

function extractNumbers(str) {
	const nonDigitRegex = /\D/g;
	return str.replace(nonDigitRegex, '');
}

class ChargingLocks extends Page {
	constructor({ loader }) {
		super({
			loader,
			tables: [
				{
					tableSelector: '.table-locks',
					TableComponent: TableLocks,
					options: {
						paginationPageSize: 15
					},
					params: {
						getData: queryParams =>
							getLocksPower({ warehouse_id: this.app.warehouse.warehouse_id, ...queryParams })
					}
				}
			],
			page: 'charging-locks'
		});

		this.tableLocks = this.tables[0];
		this.customSelect = new Select({ uniqueName: 'select-change-display' });
		this.pagination = new Pagination(this.wrapper.querySelector('.locks__footer'), {
			pageSize: this.tables[0].gridOptions.paginationPageSize
		});
		// this.filterLocks = new FilterLocks(this.wrapper.querySelector('.btn-set-filters'))
		this.locks = this.wrapper.querySelector('.locks');
		this.locksContent = this.wrapper.querySelector('.locks__content');

		this.inputSearch = this.wrapper.querySelector('.input-search');
		this.btnSort = this.wrapper.querySelector('.btn-set-sort');

		this.customSelect.onChange = (e, select, value) => {
			this.wrapper.querySelectorAll('.locks-content')?.forEach(el => el.classList.add('_none'));
			if (value === 'tile') {
				this.btnSort.classList.remove('_none')
			} else {
				this.btnSort.classList.add('_none')
			}
			this.wrapper.querySelector(`[data-locks-content="${value}"]`)?.classList.remove('_none');
		};

		this.inputSearch &&
			this.inputSearch.addEventListener('input', this.handleInputSearch.bind(this));
		this.btnSort && this.btnSort.addEventListener('click', this.handleBtnSortClick.bind(this));

		this.pagination.onChangeShowCount = (count, cntAll) => {
			this.changeQueryParams({
				show_cnt: count,
				page: count == cntAll ? null : this.queryParams.page
			});
		};
		this.pagination.onPageChange = page => this.changeQueryParams({ page });
	}

	async getData(queryParams = {}) {
		let getSchemeArr = [];

		if (this.customSelect.selectValue == 'map') {
			const floors = Array.from(
				{ length: this.app.warehouse.num_of_floors },
				(_, index) => index + 1
			);

			for (const floor of floors) {
				const scheme = await getScheme(this.app.warehouse.warehouse_id, floor);
				getSchemeArr.push(scheme);
			}

			queryParams = { show_cnt: this.pagination.cntAll || 1000, ...queryParams };
		}

		return Promise.all([
			getLocksPower({ show_cnt: this.tables[0].gridOptions.paginationPageSize, ...queryParams }),
			getSchemeArr
		]);
	}

	onRender(data) {
		const [{ rooms_x_locks = [], cnt_all, cnt_pages, page }, schemes = []] = data;
		this.pagination.setPage(page, cnt_pages, cnt_all);

		if (rooms_x_locks.length) {
			this.locksContent.innerHTML = rooms_x_locks.map(lock => cardHtml(lock)).join('');
		} else {
			this.locksContent.innerHTML = `<div class="not-data"><span>Нет замков для отображения</span></div>`;
		}

		if (schemes.length) {
			this.wrapper.querySelector('.maps-locks .schemes').innerHTML = schemes
				.map(
					(scheme, i) => `
      <div class="warehouse__schemes" style="min-height: 370px;">
      <p style="margin-bottom: 10px;">Этаж ${i + 1}</p>  
        <div class="warehouse__wrap-scheme wrap-scheme">${scheme}</div></div>`
				)
				.join('');

			const cells = this.wrapper.querySelectorAll('.warehouse__svg-cell');

			cells.length &&
				cells.forEach(cell => {
					const [room = null] = rooms_x_locks.filter(
						room => room.room_name == cell.getAttribute('data-cell-num')
					);
					if (!room) return;
					if (50 <= room.electric_quantity && room.electric_quantity <= 100) {
						cell.dataset.rented = 0;
					} else if (20 <= room.electric_quantity && room.electric_quantity <= 49) {
						cell.dataset.rented = 0.75;
					} else {
						cell.dataset.rented = 1;
					}
				});
		}
	}

	handleInputSearch(e) {
		const input = e.target;
		input.value = extractNumbers(input.value);
		clearTimeout(this.timerInput);
		this.timerInput = setTimeout(() => {
			this.changeQueryParams({ search_str: input.value, show_cnt: 1000 });
		}, 600);
	}

	handleBtnSortClick(e) {
		this.btnSort.classList.toggle('sort');
		let queryParams = { sort_column: 'electric_quantity' };

		if (this.btnSort.classList.contains('sort')) {
			queryParams.sort_direction = 'desc';
		} else {
			queryParams.sort_direction = 'asc';
		}

		this.changeQueryParams(queryParams);
	}

	async changeQueryParams(params) {
		this.queryParams = mergeQueryParams(this.queryParams, params);

		try {
			this.loader.enable();
			const dataEntities = await this.getData(this.queryParams);
			this.onRender(dataEntities);
		} catch (error) {
			console.error(error);
			throw error;
		} finally {
			this.loader.disable();
		}
	}
}

export default ChargingLocks;
