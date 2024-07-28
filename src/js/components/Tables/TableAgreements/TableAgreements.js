import Table from '../Table.js';
// import { validateRow } from './validate.js';

import { api } from "../../../settings/api.js";

import { actions } from '../utils/actions.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { addPrefixToNumbers } from '../utils/addPrefixToNumbers.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { getFormattedDate } from '../../../utils/getFormattedDate.js';
import { downloadAgreement } from '../../../settings/request.js';


class TableAgreements extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        { headerCheckboxSelection: true, checkboxSelection: true, width: 50, resizable: false, sortable: false, },
        {
          headerName: 'Договор', field: 'agrid', minWidth: 80, flex: 0.3,
          cellRenderer: params => {
            const span = document.createElement('span')
            span.classList.add('table-span-agrid')
            span.textContent = params.value ? addPrefixToNumbers(params.value) : 'нет'
            return cellRendererInput(params, undefined, null, span)
          }
        },
        {
          headerName: 'ФИО', field: 'fullname', minWidth: 300, flex: 1,
          cellRenderer: params => cellRendererInput(params, undefined, 'profile')
        },
        {
          headerName: 'Дата начала', field: 'agrbegdate', minWidth: 130, flex: 0.6,
          cellRenderer: params => cellRendererInput(params, getFormattedDate, 'calendar')
        },
        {
          headerName: 'Платеж в мес.', field: 'price', minWidth: 100, flex: 0.5,
          cellRenderer: params => {
            const span = document.createElement('span')
            span.classList.add('table-span-price')
            span.innerHTML = params.value ? formattingPrice(params.value) : 'нет'
            return cellRendererInput(params, undefined, null, span)
          }
        },
        {
          headerName: 'Ячейки', field: 'room_ids', minWidth: 70, flex: 0.5,
          valueFormatter: params => params.value ? addPrefixToNumbers(params.value) : 'нет'
        },
        {
          headerName: 'Конец договора', field: 'agrplanenddate', minWidth: 100, flex: 0.5,
          valueFormatter: params => params.value ? getFormattedDate(params.value) : 'нет'
        },
        {
          headerName: 'Способ оплаты', field: 'last_payment_type', minWidth: 100, flex: 0.5,
        },
        {
          headerName: 'Действия', field: 'actions', width: 80,
          cellRenderer: params => this.actionCellRenderer(params), resizable: false, sortable: false
        }
      ],
    };

    const defaultParams = {
      selectTypeUser: true,
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

      },
      attrModal: 'modal-agreement',
      data: params.data
    })

    // tippyInstance.options.onEdit = instance => {
    //   this.validatorRow?.revalidate().then(isValid => {
    //     if (isValid) {
    //       const formData = new FormData(form)
    //       let data = {}

    //       formData.set('username', formData.get('username').replace(/[+() -]/g, ''))
    //       Array.from(formData).forEach(obj => data[obj[0]] = obj[1])

    //       this.editClient(data).finally(() => {
    //         instance.toggleEdit(button)
    //         instance.isEdit = false

    //         this.disableEditing(row) // метод из родительского класса для откл редактирования полей
    //         this.validatorRow.destroy()
    //       })
    //     }
    //   })
    // }

    // tippyInstance.options.onEnableEdit = () => {
    //   form = document.createElement('form')
    //   const inputs = this.enableEditing(row) // метод из родительского класса для вкл редактирования полей

    //   inputs.forEach(input => {
    //     const inputClone = input.cloneNode(true);
    //     inputClone.value = input.value; // Установить начальное значение
    //     form.appendChild(inputClone);

    //     if (input.name === 'username') {
    //       Inputmask.default("+7 (999) 999-99-99").mask(input)
    //     }

    //     // Обработчик событий для синхронизации значений
    //     input.addEventListener('input', () => {
    //       inputClone.value = input.value;
    //       this.validatorRow?.revalidateField(inputClone).then(isValid => {
    //         if (isValid) {
    //           input.classList.remove('just-validate-error-field')
    //         } else {
    //           input.classList.add('just-validate-error-field')
    //         }
    //       })
    //     });
    //   });

    //   this.validatorRow = validateRow(form)
    // }

    return button
  }

  render(data) {
    const { agreements, cnt_pages, page } = data;
    this.setPage(page, cnt_pages)
    this.gridApi.setGridOption('rowData', agreements)
    this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, agreements.length])
  }

  async download(data) {
    try {
      this.loader.enable()
      let reqData = {}

      if (data.length) {
        const agrIds = data.map(obj => obj.agrid)
        reqData.all_agrs = 0
        reqData.agrids = agrIds
      } else {
        reqData.all_agrs = 1
      }

      const res = await downloadAgreement(reqData)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default TableAgreements
