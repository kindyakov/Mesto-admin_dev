import Table from '../Table.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { getFormattedDate } from '../../../utils/getFormattedDate.js';
import { createElement } from '../../../settings/createElement.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { api } from '../../../settings/api.js';
import { cellRendererSelect } from '../utils/cellRenderer.js';

class TablePricesCells extends Table {
	constructor(selector, options, params) {
		const defaultOptions = {
			columnDefs: [
				{
					headerName: 'Тип размера',
					field: 'size_type',
					minWidth: 60,
					flex: 0.5,
					cellRenderer: params => {
						let options = ['Площадь (м²)', 'Объем (м³)'];
						const span = createElement('span', {
							classes: ['table-span-w', 'gray'],
							content: params.value
						});

						if (params.value) {
							const index = options.indexOf(params.value);
							if (index !== -1) {
								const [item] = options.splice(index, 1);
								options.unshift(item);
							}
						} else {
							params.value = options[0];
							params.setValue(params.value);
						}

						this.addHandleDbClickCell(params);
						return cellRendererSelect(params, {
							el: span,
							options,
							onSelect: value => {
								params.data.size_type = value;
								params.setValue(value);
							}
						});
					}
				},
				{
					headerName: 'Площадь/объем от',
					field: 'size_start',
					minWidth: 50,
					flex: 0.5,
					cellRenderer: params => {
						const el = cellRendererInput(params, {
							inputmode: 'decimal'
						});
						this.addHandleDbClickCell(params);

						return el;
					}
				},
				{
					headerName: 'Площадь/объем до',
					field: 'size_end',
					minWidth: 50,
					flex: 0.5,
					cellRenderer: params => {
						const el = cellRendererInput(params, {
							inputmode: 'decimal'
						});
						this.addHandleDbClickCell(params);

						return el;
					}
				},
				{
					headerName: 'Цена 1 месяц',
					field: 'price_1m',
					minWidth: 50,
					flex: 0.5,
					cellRenderer: params => {
						const el = cellRendererInput(params, {
							inputmode: 'numeric',
							funcFormate: formattingPrice
						});
						this.addHandleDbClickCell(params);

						return el;
					}
				},
				{
					headerName: 'Цена 6 месяц',
					field: 'price_6m',
					minWidth: 50,
					flex: 0.5,
					cellRenderer: params => {
						const el = cellRendererInput(params, {
							inputmode: 'numeric',
							funcFormate: formattingPrice
						});
						this.addHandleDbClickCell(params);

						return el;
					}
				},
				{
					headerName: 'Цена 12 месяц',
					field: 'price_11m',
					minWidth: 50,
					flex: 0.5,
					cellRenderer: params => {
						const el = cellRendererInput(params, {
							inputmode: 'numeric',
							funcFormate: formattingPrice
						});
						this.addHandleDbClickCell(params);

						return el;
					}
				},
				{
					headerName: '',
					field: 'buttons',
					width: 50,
					resizable: false,
					sortable: false,
					floatingFilter: false,
					closeOnApply: false,
					filter: null,
					cellRenderer: ({ api, value, data }) => {
						const button = createElement('button', {
							classes: ['btn-del', '_show']
						});

						button.addEventListener('click', () => {
							api.applyTransaction({ remove: [data] });
							this.btnApplyChanges?.removeAttribute('disabled');
						});

						return button;
					}
				}
			],
			pagination: false,
			suppressColumnVirtualisation: true
		};

		const defaultParams = {};

		const mergedOptions = Object.assign({}, defaultOptions, options);
		const mergedParams = Object.assign({}, defaultParams, params);
		super(selector, mergedOptions, mergedParams);

		this.onReadyFunctions.push(() => {
			this.tableFooter = this.table.querySelector('.ag-paging-panel');
			if (this.tableFooter) {
				this.tableFooter.removeAttribute('aria-hidden');
				this.tableFooter.classList.remove('ag-hidden');
				this.tableFooter.innerHTML = `
				<div style="display:flex;gap:10px;margin-left:auto;">
					<button class="button btn-apply-changes" disabled>Применить изменения</button>
					<button class="button btn-send-changes-server" disabled>Отправить изменения на сервер</button>
				</div>`;

				this.btnApplyChanges = this.tableFooter.querySelector('.btn-apply-changes');
				this.btnSendChangesServer = this.tableFooter.querySelector('.btn-send-changes-server');

				this.btnApplyChanges &&
					this.btnApplyChanges.addEventListener('click', () => this.handleClickBtnApplyChanges());

				this.btnSendChangesServer &&
					this.btnSendChangesServer.addEventListener('click', () =>
						this.handleClickBtnSendChangesServer()
					);
			}
		});
	}

	onRendering(data) {
		this.gridApi.setGridOption('rowData', data);
		// this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, timepoints.length]);
	}

	addHandleDbClickCell({ eGridCell }) {
		eGridCell.addEventListener('dblclick', e => {
			const row = eGridCell.closest('.ag-row');
			const wp = eGridCell.querySelector('.wp-input-cell');

			if (wp.classList.contains('not-edit')) {
				const input = wp.querySelector('input') || wp.querySelector('select');
				// wp.classList.remove('not-edit');

				this.changeReadonly(input);
				this.btnApplyChanges?.removeAttribute('disabled');
			} else {
			}
		});
	}

	afterAddRow({ data, element }) {
		const inputs = element.querySelectorAll('select, input');

		inputs.length && inputs.forEach(input => this.changeReadonly(input));
		this.btnApplyChanges?.removeAttribute('disabled');
	}

	handleClickBtnApplyChanges() {
		const rowsNode = this.getAllRowsWithElements();
		let isErr = false;

		rowsNode?.length &&
			rowsNode.forEach(({ data, element }) => {
				const inputs = element.querySelectorAll('input');
				inputs.length &&
					inputs.forEach(input => {
						if (!input.value) {
							isErr = true;
							input.classList.add('_err');
						}
					});
			});

		if (isErr) return;

		let pricesCells = [];

		rowsNode?.length &&
			rowsNode.forEach(({ data, element }) => {
				const inputs = element.querySelectorAll('input, select');
				inputs.length && inputs.forEach(input => this.changeReadonly(input, true));
				delete data.buttons;
				pricesCells.push(data);
			});

		this.pricesCells = pricesCells;
		localStorage.setItem('prices-cells', JSON.stringify(pricesCells));
		this.btnApplyChanges?.setAttribute('disabled', '');
		this.btnSendChangesServer?.removeAttribute('disabled');
	}

	handleClickBtnSendChangesServer() {}

	async changePrices(data) {
		try {
			this.loader.enable();
			const response = await api.post('/_change_prices_', { apply_to_agrs: 0, changes: data });
			if (response.status !== 200) return;
			this.app.notify.show(response.data);
		} catch (error) {
			throw error;
		} finally {
			this.loader.disable();
		}
	}
}

export default TablePricesCells;
