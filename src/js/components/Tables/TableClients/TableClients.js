import Table from '../Table.js';
import { actions } from './actions.js';
import { validateRow } from './validate.js';

import { formattingPrice, formatPhoneNumber } from '../../../utils/formattingPrice.js';
import { declOfNum } from '../../../utils/declOfNum.js';
import { addPrefixToNumbers } from '../utils/addPrefixToNumbers.js';
import { cellRendererInput } from '../utils/cellRenderer.js';

import modalClient from '../../Modals/ModalClient/ModalClient.js';

class TableClients extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        { headerCheckboxSelection: true, checkboxSelection: true, width: 50, resizable: false, sortable: false, },
        {
          headerName: 'ФИО', field: 'fullname', flex: 1.5,
          cellRenderer: params => cellRendererInput(params, undefined, 'profile')
        },
        { headerName: 'Телефон', field: 'username', flex: 0.8, cellRenderer: params => cellRendererInput(params, formatPhoneNumber) },
        { headerName: 'Почта', field: 'email', flex: 1.2, sortable: false, cellRenderer: params => cellRendererInput(params) },
        { headerName: 'Ячейки', field: 'rooms', flex: 0.5, sortable: false, valueFormatter: params => params.value ? addPrefixToNumbers(params.value) : 'нет' },
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

    const mergedOptions = Object.assign({}, defaultOptions, options);
    super(selector, mergedOptions, params); // Вызов конструктора суперкласса

    // Убедитесь, что методы привязаны к текущему экземпляру класса
    this.isCellEditable = this.isCellEditable.bind(this);
    this.actionCellRenderer = this.actionCellRenderer.bind(this);
    this.enableEditing = this.enableEditing.bind(this);
  }

  // Метод для проверки условия редактирования
  isCellEditable(params) {
    // Здесь добавьте условие, при котором редактирование разрешено
    // Например, разрешить редактирование только если значение в поле 'editableField' равно true
    return params.data.editableField === true;
  }

  actionCellRenderer(params) {
    const { user_id, user_type } = params.data
    const row = params.eGridCell.closest('.ag-row')
    const button = document.createElement('button');
    button.classList.add('button-table-actions');
    button.setAttribute('data-user-id', user_id)
    button.setAttribute('data-user-type', user_type)
    button.innerHTML = `<span></span><span></span><span></span><svg class='icon icon-check'><use xlink:href='img/svg/sprite.svg#check'></use></svg>`;

    const tippyInstance = actions(button, { ...params.data, modalClient }, {
      onEdit: (instance) => {
        // Проверять валидацию, если валидация верная то instance.isEdit = false и instance.toggleEdit(button) и выключить редактирование полей
        this.validatorRow.revalidate().then(isValid => {
          console.log(isValid)

        })
      },
      onEnableEdit: () => {
        const form = document.createElement('form')
        const inputs = this.enableEditing(row)
        inputs.forEach(input => {
          const inputClone = input.cloneNode(true);
          inputClone.value = input.value; // Установить начальное значение
          form.appendChild(inputClone);

          // Обработчик событий для синхронизации значений
          input.addEventListener('input', () => {
            inputClone.value = input.value;
            this.validatorRow?.revalidateField(inputClone).then(isValid => {
              if (!isValid) {
                input.classList.add('just-validate-error-field')
                if (inputClone.name === 'username') {
                  input.value = inputClone.value
                }
              } else {
                input.classList.remove('just-validate-error-field')
              }
            })
          });
        });

        this.validatorRow = validateRow(form)
      },
    })

    return button;
  }

  enableEditing(row) {
    if (!row) return []
    const inputs = row.querySelectorAll('.cell-input')

    inputs.length && inputs.forEach(input => {
      input.classList.remove('not-edit')
      input.removeAttribute('readonly')
    })

    return inputs
  }

  disableEditing(row) {
    if (!row) return
    const inputs = row.querySelectorAll('.cell-input')

    inputs.length && inputs.forEach(input => {
      input.classList.add('not-edit')
      input.setAttribute('readonly', true)
    })
  }

  render(data) {
    const { clients, cnt_pages, page } = data;
    this.setPage(page, cnt_pages)
    this.gridApi.setGridOption('rowData', clients)
    this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 20, clients.length])
  }
}

export default TableClients

