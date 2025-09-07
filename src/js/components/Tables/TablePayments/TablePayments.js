import Table from '../Table.js';
import { validateRow } from './validate.js';

import { api } from '../../../settings/api.js';
import { downloadPayments } from '../../../settings/request.js';

import { actions } from '../utils/actions.js';
import { addPrefixToNumbers } from '../utils/addPrefixToNumbers.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { observeCell } from '../utils/observeCell.js';

import { formattingPrice } from '../../../utils/formattingPrice.js';
import { getFormattedDate } from '../../../utils/getFormattedDate.js';
import { createElement } from '../../../settings/createElement.js';

class TablePayments extends Table {
	constructor(selector, options, params) {
		const defaultOptions = {
			columnDefs: [
				{
					headerCheckboxSelection: true,
					checkboxSelection: true,
					width: 50,
					resizable: false,
					sortable: false
				},
				{
					headerName: 'Договор',
					field: 'agrid',
					minWidth: 90,
					flex: 0.3,
					comparator: (a, b) => {
						const numA = parseInt(a, 10)
						const numB = parseInt(b, 10)
						return numA - numB
					},
					cellRenderer: params => {
						const span = document.createElement('span');
						span.classList.add('table-span-agrid');
						span.textContent = params.value ? addPrefixToNumbers(params.value) : 'нет';
						return cellRendererInput(params, { el: span });
					}
				},
				{
					headerName: 'ФИО',
					field: 'fullname',
					minWidth: 300,
					flex: 0.8,
					cellRenderer: params => {
						const wp = cellRendererInput(params, { iconId: 'profile' });
						observeCell(wp, params);
						return wp;
					}
				},
				{
					headerName: 'Дата платежа',
					field: 'payment_date',
					minWidth: 130,
					flex: 0.5,
					cellRenderer: params =>
						cellRendererInput(params, { funcFormate: getFormattedDate, iconId: 'calendar' })
				},
				{
					headerName: 'Вид поступления',
					field: 'type',
					minWidth: 100,
					flex: 0.5
				},
				{
					headerName: 'Статья учета',
					field: 'account_article',
					minWidth: 80,
					flex: 0.5
				},
				{
					headerName: 'Сумма',
					field: 'amount',
					minWidth: 110,
					flex: 0.5,
					cellRenderer: params => {
						const span = document.createElement('span');
						span.classList.add('table-span-price');
						span.innerHTML = params.value ? formattingPrice(params.value) : 'нет';
						return cellRendererInput(params, { el: span });
					}
				},
				{
					headerName: 'Сотрудник',
					field: 'manager_name',
					minWidth: 115,
					flex: 0.5
				},
				{
					headerName: 'Физ./Юр.',
					field: 'user_type',
					minWidth: 95,
					flex: 0.5,
					valueFormatter: params => (params.value === 'f' ? 'Физ. лицо' : 'Юр. лицо')
				},
				{
					headerName: 'Действия',
					field: 'actions',
					width: 90,
					resizable: false,
					sortable: false,
					cellRenderer: params => this.actionCellRenderer(params)
				}
			]
		};

		const defaultParams = {
			selectTypeUser: true,
			onChangeTypeUser: () => { }
		};

		const mergedOptions = Object.assign({}, defaultOptions, options);
		const mergedParams = Object.assign({}, defaultParams, params);
		super(selector, mergedOptions, mergedParams);

		this.actionCellRenderer = this.actionCellRenderer.bind(this);
	}

	actionCellRenderer(params) {
		const { agrid, user_type, payment_id } = params.data;
		const row = params.eGridCell.closest('.ag-row');
		const button = createElement('button', {
			classes: ['button-table-actions'],
			content: `<span></span><span></span><span></span><svg class='icon icon-check'><use xlink:href='#check'></use></svg>`
		});
		let form;

		const tippyInstance = actions(button, {
			buttonsIs: [false, true],
			attrModal: 'modal-agreement',
			attributes: [['agr-id', params.data.agrid]],
			placement: 'bottom-right',
			data: params.data
		});

		tippyInstance.options.onEdit = instance => {
			this.validatorRow?.revalidate().then(isValid => {
				if (isValid) {
					const formData = new FormData(form);
					let data = { payment_id };

					formData.set(
						'payment_date',
						getFormattedDate(formData.get('payment_date'), 'YYYY-MM-DD')
					);

					Array.from(formData).forEach(obj => (data[obj[0]] = obj[1]));

					this.editPayment(data).finally(() => {
						instance.toggleEdit(button);
						instance.isEdit = false;

						this.disableEditing(row); // метод из родительского класса для откл редактирования полей
						this.validatorRow.destroy();
					});
				}
			});
		};

		tippyInstance.options.onEnableEdit = () => {
			form = document.createElement('form');
			const inputs = this.enableEditing(row); // метод из родительского класса для вкл редактирования полей
			const inputsObj = {};

			inputs.forEach(input => {
				const inputClone = input.cloneNode(true);
				inputClone.value = input.value; // Установить начальное значение
				inputsObj[input.name] = input;
				form.appendChild(inputClone);

				// Обработчик событий для синхронизации значений
				input.addEventListener('input', () => {
					inputClone.value = input.value;
					this.validatorRow?.revalidateField(inputClone).then(isValid => {
						input.value = inputClone.value; // обратная синхронизация после валидации клона
						if (isValid) {
							input.classList.remove('just-validate-error-field');
						} else {
							input.classList.add('just-validate-error-field');
						}
					});
				});
			});

			this.validatorRow = validateRow(form, { inputsObj });
		};

		return button;
	}

	onRendering({ payments = [], cnt_pages, page, cnt_all }) {
		this.cntAll = cnt_all;
		this.pagination.setPage(page, cnt_pages, cnt_all);
		// payments = payments.map(p => ({ ...p, agrid: +p.agrid }))
		this.gridApi.setGridOption('rowData', payments);
		// this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, payments.length])
	}

	async editPayment(data) {
		try {
			this.loader.enable();
			const response = await api.post('/_edit_payment_', data);
			if (response.status !== 200) return;
			this.app.notify.show(response.data);
		} catch (error) {
			console.error(error);
		} finally {
			this.loader.disable();
		}
	}

	async download(data, isAll) {
		try {
			this.loader.enable();
			const { returned, filter_start_date = null, filter_end_date = null } = this.queryParams;
			let reqData = { returned, warehouse_id: this.app.warehouse.warehouse_id };

			if (filter_start_date && filter_end_date) {
				reqData = { ...reqData, filter_start_date, filter_end_date };
			}

			if (isAll) {
				reqData.all_payments = 1;
			} else {
				const payment_ids = data.map(obj => obj.payment_id);
				reqData = { ...reqData, all_payments: 0, payment_ids };
			}

			const res = await downloadPayments(reqData);
		} catch (error) {
			console.error(error);
		} finally {
			this.loader.disable();
		}
	}
}

export default TablePayments;
