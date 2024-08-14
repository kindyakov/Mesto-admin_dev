import Inputmask from "inputmask";

import Table from '../Table.js';
import { validateRow } from './validate.js';

import tippy from '../../../configs/tippy.js';

import { api } from "../../../settings/api.js";


import { actions } from '../utils/actions.js';
import { addPrefixToNumbers } from '../utils/addPrefixToNumbers.js';
import { cellRendererInput } from '../utils/cellRenderer.js';

import { formattingPrice, formatPhoneNumber } from '../../../utils/formattingPrice.js';
import { declOfNum } from '../../../utils/declOfNum.js';
import { outputInfo } from "../../../utils/outputinfo.js";
import { downloadClient } from '../../../settings/request.js';

import { createElement } from '../../../settings/createElement.js';
import { dateFormatter } from "../../../settings/dateFormatter.js";

class TableClients extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerCheckboxSelection: true, checkboxSelection: true, width: 50, resizable: false, sortable: false,
          // cellRenderer: params => {
          //   const { user_id } = params.data
          // }
        },
        {
          headerName: 'ФИО', field: 'fullname', minWidth: 300, flex: 1,
          cellRenderer: params => cellRendererInput(params, { iconId: 'profile' })
        },
        { headerName: 'Телефон', field: 'username', minWidth: 170, flex: 0.5, cellRenderer: params => cellRendererInput(params, { funcFormate: formatPhoneNumber }) },
        { headerName: 'Почта', field: 'email', minWidth: 260, flex: 0.5, cellRenderer: params => cellRendererInput(params) },
        {
          headerName: 'Ячейки', field: 'rooms', minWidth: 90, flex: 0.5,
          cellRenderer: params => {
            const span = createElement('span', ['span-rooms-id'], `нет`)
            if (params.value) {
              span.innerHTML = addPrefixToNumbers(params.value)
              if (params.value.split(',').length > 1) {
                tippy(span, {
                  trigger: 'mouseenter',
                  placement: 'top',
                  arrow: true,
                  content: `<span class="tippy-info-span tippy-info-rooms-id" style="font-size: 14px;">${addPrefixToNumbers(params.value)}</span>`,
                })
              }
            }
            return span
          }
        },
        {
          headerName: 'Платеж в мес.', field: 'month_payment', minWidth: 100, flex: 0.5,
          cellRenderer: params => {
            const span = document.createElement('span')
            span.classList.add('table-span-price')
            span.innerHTML = params.value ? formattingPrice(params.value) : 'нет'
            return span
          }
        },
        {
          headerName: 'До платежа', field: 'days_left', minWidth: 100, flex: 0.5,
          cellRenderer: params => {
            const p = createElement('p', ['table-p', 'days-left-p'], `<svg class='icon icon-calendar'><use xlink:href='img/svg/sprite.svg#calendar'></use></svg>
            <span>${params.value ? `${params.value} ${declOfNum(Math.abs(params.value), ['День', 'Дня', 'Дней'])}` : 'Нет'}</span>`)

            if (params.value && params.value >= 0) {
              const date = new Date();
              date.setDate(date.getDate() + params.value);

              tippy(p, {
                trigger: 'mouseenter',
                placement: 'top',
                arrow: true,
                interactive: false,
                content: `<span class="tippy-info-span tippy-info-rooms-id">${dateFormatter(date)}</span>`,
              })
            }

            if (params.value && params.value >= 0 && params.value <= 5) {
              p.classList.add('_payments-soon')
              tippy(p, {
                trigger: 'mouseenter',
                placement: 'bottom-end',
                content: `<div class="tippy-contact"><p>Связались с клиентом?</p><button class="yes"><span>Да</span></button><button><span>Нет</span></button></div>`
              })
            }
            return p
          }
        },
        {
          headerName: 'Действия', field: 'actions', width: 90,
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

  onRendering({ clients = [], cnt_pages, page }) {
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

  async download(data) {
    try {
      this.loader.enable()
      let reqData = {}

      if (data.length) {
        const userIds = data.map(obj => obj.user_id)
        reqData.all_clients = 0
        reqData.user_ids = userIds
      } else {
        reqData.all_clients = 1
      }

      const res = await downloadClient(reqData)
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      this.loader.disable()
    }
  }
}

export default TableClients

