import uniqBy from 'lodash.uniqby';
import merge from 'lodash.merge';

import Table from '../Table.js';
import CustomFilter from '../utils/CustomFilter/CustomFilter.js';

import { addPrefixToNumbers } from '../utils/addPrefixToNumbers.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { observeCell } from '../utils/observeCell.js';
import { createDaysLeftElement } from '../utils/createDaysLeftElement.js';

import { formattingPrice } from '../../../utils/formattingPrice.js';
import { getFormattedDate } from '../../../utils/getFormattedDate.js';
import { mergeQueryParams } from '../../../utils/buildQueryParams.js';
import { sort } from '../../../utils/sort.js';

import { downloadFuturePayments } from '../../../settings/request.js';
import { createElement } from '../../../settings/createElement.js';
import { renderTextHeader } from '../utils/renderTextHeader.js';

import tippy from '../../../configs/tippy.js';

class TableUpcomingPayments extends Table {
	constructor(selector, options, params) {
		const defaultOptions = {
			columnDefs: [
				{
					headerCheckboxSelection: true,
					checkboxSelection: true,
					width: 50,
					resizable: false,
					sortable: false,
					filter: false
				},
				{
					headerName: 'Дата платежа',
					field: 'write_off_date',
					minWidth: 140,
					flex: 0.2,
					// filter: 'agDateColumnFilter',
					cellRenderer: params =>
						cellRendererInput(params, { funcFormate: getFormattedDate, iconId: 'calendar' })
				},
				{
					headerName: 'Сумма',
					field: 'price',
					minWidth: 180,
					flex: 0.5,
					filter: 'agNumberColumnFilter',
					cellRenderer: params => {
						const span = createElement('span', {
							classes: ['table-span-price'],
							content: params.value ? formattingPrice(params.value) : 'нет'
						});

						if (params.data.real_payment == 0) {
							span.classList.add(
								new Date(params.data.write_off_date) <= new Date() ? 'error' : 'warning'
							);
						}

						return cellRendererInput(params, { el: span });
					},
					filterRenderer: params => {
						const targetChild = params.filterWrapper.children[1];
						const dataBtn = [
							{ bg: '#CFF1E6', color: '#0b704e', params: { real_payment: 1, color: 'green' } },
							{ bg: '#FCF1D6', color: '#efbb34', params: { real_payment: 0, color: 'yellow' } },
							{ bg: '#FFDBDB', color: '#d42424', params: { real_payment: 0, color: 'red' } }
						];
						const customFilter = this.customFilter;

						if (params.column.colDef.dropdownTarget) {
							if (this.queryParams.real_payment == undefined) {
								params.column.colDef.dropdownTarget.removeAttribute('style');
							} else {
								const [{ bg, color }] = dataBtn.filter(obj => {
									const { real_payment, color = null } = obj.params;
									if (
										real_payment == this.queryParams.real_payment &&
										color &&
										color == this.queryParams.color
									) {
										return obj;
									}
								});

								params.column.colDef.dropdownTarget.style.cssText = `background:${bg};border-color:${color};`;
							}
						}

						if (params.filterWrapper.querySelector('.dropdown-target')) return;

						const dropdownTarget = createElement('div', {
							classes: ['dropdown-target'],
							content: `<p>Фильтр по цвету</p><svg class="icon icon-arrow"><use xlink:href="#arrow"></use></svg>`
						});

						const instanceTippy = tippy(dropdownTarget, {
							maxWidth: 150,
							placement: 'right-start',
							offset: [0, 12],
							// appendTo: params.filterWrapper.closest('.ag-popup'),
							trigger: 'mouseenter',
							onCreate(instance) {
								const content = instance.popper.querySelector('.tippy-content');
								content.style.cssText = `display:flex;flex-direction:column;gap:5px;padding:15px;border: 1px solid #dddcdc;border-radius: 4px;`;

								dataBtn.forEach(obj => {
									const btn = createElement('button', {
										classes: ['btn-rect'],
										attributes: [['style', `color: ${obj.color};background: ${obj.bg};`]],
										content: obj.content ? obj.content : ''
									});
									btn.addEventListener('click', e => handleCLick(e, obj));
									content.appendChild(btn);
									obj.btn = btn;
								});

								function handleCLick(e, { params, bg, color }) {
									e.stopPropagation();
									const btnActive = content.querySelector('._active');

									if (btnActive && btnActive == e.target) {
										btnActive.classList.remove('_active');
										dropdownTarget.removeAttribute('style');
										return;
									}

									btnActive?.classList.remove('_active');
									e.target.classList.add('_active');

									dropdownTarget.style.cssText = `background:${bg};border-color:${color};`;
									customFilter.changeReqData(params);
									instance.hide();
								}

								instance.popper.addEventListener('mousedown', e => e.stopPropagation());
							}
						});

						targetChild.insertAdjacentElement('afterend', dropdownTarget);

						params.column.colDef.clearCustomFilter = () => {
							dropdownTarget.removeAttribute('style');
							delete this.queryParams.real_payment;
							delete this.queryParams.color;
						};
						params.column.colDef.dropdownTarget = dropdownTarget;
					}
				},
				{
					headerName: 'ФИО',
					field: 'fullname',
					minWidth: 300,
					flex: 1,
					cellRenderer: params => {
						const wp = cellRendererInput(params, { iconId: 'profile' });
						observeCell(wp, params);
						return wp;
					}
				},
				{
					headerName: 'Договор',
					field: 'agrid',
					minWidth: 90,
					flex: 0.5,
					filter: 'agNumberColumnFilter',
					cellRenderer: params => {
						const span = createElement('span', {
							classes: ['table-span-agrid'],
							content: params.value ? addPrefixToNumbers(params.value) : 'нет'
						});
						return cellRendererInput(params, { el: span });
					}
				},
				{
					headerName: 'Площадь',
					field: 'area',
					minWidth: 180,
					flex: 0.3,
					filter: 'agNumberColumnFilter',
					valueFormatter: params => `${params.value} м²`
				},
				{
					headerName: 'Средняя ставка',
					field: 'price_1m',
					minWidth: 200,
					flex: 0.5,
					filter: 'agNumberColumnFilter',
					cellRenderer: params => {
						const span = createElement('span', {
							classes: ['table-span-price'],
							content: params.value ? formattingPrice(params.value) : 'нет'
						});
						return cellRendererInput(params, { el: span });
					}
				},
				{
					headerName: 'Физ./Юр.',
					field: 'user_type',
					minWidth: 90,
					flex: 0.5,
					valueFormatter: params => (params.value === 'f' ? 'Физ. лицо' : 'Юр. лицо')
				},
				{
					headerName: 'Депозит',
					field: 'deposit',
					minWidth: 150,
					flex: 0.5,
					filter: 'agNumberColumnFilter',
					cellRenderer: params => {
						const span = createElement('span', {
							classes: ['table-span-price'],
							content: params.value ? formattingPrice(params.value) : ''
						});
						return cellRendererInput(params, { el: span });
					}
				},
				{
					headerName: 'Осталось дней',
					field: 'days_left',
					minWidth: 100,
					flex: 0.5,
					filter: 'agNumberColumnFilter',
					cellRenderer: params => createDaysLeftElement(params)
				}
			],
			suppressColumnVirtualisation: true,
			onFilterOpened: e => {
				const field = e.column.colDef.field;
				const filterWrapper = e.eGui.querySelector('.ag-filter-body-wrapper');
				const data = e.api.getGridOption('rowData');
				const fullCurrentData = sort(uniqBy(this.data.map(obj => obj[field]))); // Сортировка по возрастанию
				const currentData = sort(uniqBy(data.map(obj => obj[field]))); // Сортировка по возрастанию
				let dataWithoutCurrentFilter = [];

				if (this.queryParams.filters) {
					if (
						Object.keys(this.queryParams.filters).length == 1 &&
						Object.keys(this.queryParams.filters)[0] == field
					) {
						dataWithoutCurrentFilter = fullCurrentData.filter(
							value => !currentData.includes(value)
						);
					} else if (Object.keys(this.queryParams.filters).length >= 2) {
						dataWithoutCurrentFilter = this.filterAndSortData(this.data, {
							...this.queryParams,
							filters: Object.keys(this.queryParams.filters).reduce((filteredObj, key) => {
								if (key !== field) {
									filteredObj[key] = this.queryParams.filters[key];
								}
								return filteredObj;
							}, {}) // Без учета текущего фильтра
						})
							.map(obj => obj[field])
							.filter(value => !currentData.includes(value))
							.sort((a, b) => a - b); // Сортировка по возрастанию
					}

					if (dataWithoutCurrentFilter?.length) {
						dataWithoutCurrentFilter = uniqBy(dataWithoutCurrentFilter);
					}
				}

				const params = {
					...e,
					filterWrapper,
					currentData,
					data,
					fullCurrentData,
					dataWithoutCurrentFilter
				};

				this.customFilter.init(params);
				this.customFilter.gridApi = this.gridApi;
				this.customFilter.wpTable = this.wpTable;
				this.customFilter.render(params, this.queryParams);
				this.customFilter.onChangeColumnParams = params => {
					e.column.colDef.filterValues = merge(e.column.colDef.filterValues || {}, params);
				};
			}, // сработает при открытие окна с фильтром
			defaultColDef: {
				filter: 'agTextColumnFilter',
				floatingFilter: true, // Добавляет панельку под заголовком
				closeOnApply: true,
				sortable: false
				// filter: 'agSetColumnFilter'
			},
			pagination: false
		};

		const defaultParams = { isPagination: false };

		const mergedOptions = Object.assign({}, defaultOptions, options);
		const mergedParams = Object.assign({}, defaultParams, params);
		super(selector, mergedOptions, mergedParams);

		this.customFilter = new CustomFilter();
		this.customFilter.onChange = queryParams => {
			// this.changeQueryParams(queryParams)
			this.btnTableFilterReset?.classList.toggle(
				'_is-filter',
				!(!queryParams.filters && !queryParams.sort_direction)
			);

			this.queryParams = queryParams;
			this.tableRendering(queryParams);
		};
	}

	onChangeSelect({ select, value }) {
		const key = [select.getAttribute('data-name')];
		const params = { [key]: !isNaN(+value) ? +value : value };
		if (key == 'show_what') {
			this.updateQueryParams(params);
		} else {
			this.changeQueryParams(params);
		}
	}

	onRendering({ agreements = [], cnt_pages, page, cnt_all = 0 }) {
		this.cntAll = cnt_all;
		this.customFilter.data = agreements;
		this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, agreements.length]);
		this.gridApi.setGridOption('rowData', agreements);
		renderTextHeader({
			tableElement: this.table,
			data: this.calcSum(agreements),
			columnMap: {
				2: ({ sum_amount }) => formattingPrice(sum_amount),
				3: ({ cnt }) => cnt,
				5: ({ sum_area }) => (sum_area ? `${sum_area.toFixed(1)} м²` : ''),
				6: ({ avg_price }) => (avg_price ? formattingPrice(avg_price) : ''),
				8: ({ sum_deposit }) => formattingPrice(sum_deposit)
			}
		});
	}

	filterAndSortData(data, params) {
		const { real_payment = -1, color = null, filters = {}, sort_column, sort_direction } = params;

		let result = data;

		if (real_payment !== -1) {
			result = result.filter(item => item.real_payment === real_payment);

			if (real_payment == 0) {
				const filters = {
					yellow: item => new Date(item.write_off_date) > new Date(),
					red: item => new Date(item.write_off_date) <= new Date()
				};

				if (filters[color]) {
					result = result.filter(filters[color]);
				}
			}
		}

		// Фильтрация по объекту filters
		if (filters && Object.keys(filters).length > 0) {
			result = result.filter(item => {
				return Object.entries(filters).every(([key, values]) => {
					if (Array.isArray(values) && values.length) {
						return values.includes(String(item[key])); // Приводим к строке для совпадения
					}
					return true; // Пропускаем фильтр, если формат некорректный
				});
			});
		}

		// Сортировка
		if (sort_column && sort_direction) {
			result.sort((a, b) => {
				const valA = a[sort_column];
				const valB = b[sort_column];

				if (sort_direction === 'asc') {
					return valA > valB ? 1 : valA < valB ? -1 : 0;
				} else if (sort_direction === 'desc') {
					return valA < valB ? 1 : valA > valB ? -1 : 0;
				}
				return 0; // Если sort_direction некорректен
			});
		}

		return result;
	}

	calcSum(agreements) {
		let data = {};

		data.sum_amount = agreements.reduce((acc, obj) => acc + obj.price, 0);
		data.cnt = agreements.length;
		data.sum_area = agreements.reduce((acc, obj) => acc + obj.area, 0);
		data.avg_price = Math.round(data.sum_amount / data.sum_area);
		data.sum_deposit = agreements.reduce((acc, obj) => acc + obj.deposit, 0);

		return data;
	}

	async updateQueryParams(params) {
		try {
			this.loader.enable();
			this.queryParams = mergeQueryParams(this.queryParams, params);
			if (!params.show_what) {
				delete this.queryParams.show_what
			}
			const data = await this.getData(this.queryParams);
			if (!data) return;
			this.data = data.agreements;
			this.onRendering(data);
		} catch (error) {
			throw error;
		} finally {
			this.loader.disable();
		}
	}

	tableRendering(queryParams = {}) {
		let data = this.filterAndSortData(this.data, queryParams);

		this.onRendering({ ...queryParams, agreements: data });
	}

	async download(data, isAll) {
		try {
			this.loader.enable();
			let reqData = {
				warehouse_id: this.app.warehouse.warehouse_id,
				show_what: this.queryParams.show_what,
				end_date: this.queryParams.end_date,
				start_date: this.queryParams.start_date
			};

			if (isAll) {
				reqData.all_payments = 1;
			} else {
				const writeIds = data.map(obj => obj.write_off_id);
				reqData.all_payments = 0;
				reqData.write_off_ids = writeIds;
			}

			const res = await downloadFuturePayments(reqData);
		} catch (error) {
			console.error(error);
			throw error;
		} finally {
			this.loader.disable();
		}
	}
}

export default TableUpcomingPayments;
