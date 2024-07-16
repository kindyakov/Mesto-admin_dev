import Inputmask from "inputmask";

import Table from '../Table.js';
import { validateRow } from './validate.js';

import { api } from "../../../settings/api.js";

import { actions } from '../utils/actions.js';
import { formattingPrice, formatPhoneNumber } from '../../../utils/formattingPrice.js';
import { declOfNum } from '../../../utils/declOfNum.js';
import { addPrefixToNumbers } from '../utils/addPrefixToNumbers.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { outputInfo } from "../../../utils/outputinfo.js";
import { Select } from "../../../modules/mySelect.js";

class TableClients extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        { headerCheckboxSelection: true, checkboxSelection: true, width: 50, resizable: false, sortable: false, },
        {
          headerName: 'ФИО', field: 'fullname', flex: 1.3,
          cellRenderer: params => cellRendererInput(params, undefined, 'profile')
        },
        { headerName: 'Телефон', field: 'username', flex: 0.8, cellRenderer: params => cellRendererInput(params, formatPhoneNumber) },
        { headerName: 'Почта', field: 'email', flex: 1, sortable: false, cellRenderer: params => cellRendererInput(params) },
        { headerName: 'Ячейки', field: 'rooms', flex: 0.5, valueFormatter: params => params.value ? addPrefixToNumbers(params.value) : 'нет' },
        {
          headerName: 'Платеж в мес.', field: 'month_payment', flex: 0.5,
          cellRenderer: params => {
            const span = document.createElement('span')
            span.classList.add('table-span-price')
            span.innerHTML = params.value ? formattingPrice(params.value) : 'нет'
            return span
          }
        },
        {
          headerName: 'До платежа', field: 'days_left', flex: 0.5,
          cellRenderer: params => {
            const p = document.createElement('p')
            p.classList.add('table-p')
            p.innerHTML = `
            <svg class='icon icon-calendar'>
              <use xlink:href='img/svg/sprite.svg#calendar'></use>
            </svg>
            <span>${params.value ? `${params.value} ${declOfNum(Math.abs(params.value), ['День', 'Дня', 'Дней'])}` : 'Нет'}</span>`
            return p
          }
        },
        {
          headerName: 'Действия', field: 'actions', flex: 0.4,
          cellRenderer: params => this.actionCellRenderer(params), resizable: false, sortable: false
        }
      ],
    };

    const defaultParams = {
      selectTypeUser: false,
      onChangeTypeUser: () => { },
    }

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);
    super(selector, mergedOptions, mergedParams);

    this.actionCellRenderer = this.actionCellRenderer.bind(this)
    this.enableEditing = this.enableEditing.bind(this)

    this.onChangeTypeUser = this.params.onChangeTypeUser
  }

  actionCellRenderer(params) {
    const { user_id, user_type } = params.data
    const row = params.eGridCell.closest('.ag-row')
    const button = document.createElement('button');
    button.classList.add('button-table-actions');
    button.innerHTML = `<span></span><span></span><span></span><svg class='icon icon-check'><use xlink:href='img/svg/sprite.svg#check'></use></svg>`;
    let form

    const tippyInstance = actions(button, {
      onOpen: () => {
        // modalClient.userId = user_id
        // modalClient.open()
      },
      attrModal: 'modal-client',
      data: params.data
    })

    tippyInstance.options.onEdit = instance => {
      this.validatorRow?.revalidate().then(isValid => {
        if (isValid) {
          const formData = new FormData(form)
          let data = { user_id }

          formData.set('username', formData.get('username').replace(/[+() -]/g, ''))
          Array.from(formData).forEach(obj => data[obj[0]] = obj[1])

          this.editClient({ client: data }).finally(() => {
            instance.toggleEdit(button)
            instance.isEdit = false

            this.disableEditing(row) // метод из родительского класса для откл редактирования полей
            this.validatorRow.destroy()
          })
        }
      })
    }

    tippyInstance.options.onEnableEdit = () => {
      form = document.createElement('form')
      const inputs = this.enableEditing(row) // метод из родительского класса для вкл редактирования полей

      inputs.forEach(input => {
        const inputClone = input.cloneNode(true);
        inputClone.value = input.value; // Установить начальное значение
        form.appendChild(inputClone);

        if (input.name === 'username') {
          Inputmask.default("+7 (999) 999-99-99").mask(input)
        }

        // Обработчик событий для синхронизации значений
        input.addEventListener('input', () => {
          inputClone.value = input.value;
          this.validatorRow?.revalidateField(inputClone).then(isValid => {
            if (isValid) {
              input.classList.remove('just-validate-error-field')
            } else {
              input.classList.add('just-validate-error-field')
            }
          })
        });
      });

      this.validatorRow = validateRow(form)
    }

    return button
  }

  render(data) {
    const { clients, cnt_pages, page } = data
    this.setPage(page, cnt_pages)

    this.gridApi.setGridOption('rowData', clients)
    this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, clients.length])
  }

  async editClient(data) {
    try {
      this.loader.enable()
      const response = await api.post('/_edit_client_', data)
      if (response.status !== 200) return
      outputInfo(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default TableClients

