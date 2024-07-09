import Table from "../Table.js";
import { validateRow } from './validate.js';

import { Select } from "../../../modules/mySelect.js";
import { api } from "../../../settings/api.js";

import { actions } from '../utils/actions.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { addPrefixToNumbers } from '../utils/addPrefixToNumbers.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { getFormattedDate } from "../../../utils/getFormattedDate.js";
import { outputInfo } from "../../../utils/outputinfo.js";

class TablePayments extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        { headerCheckboxSelection: true, checkboxSelection: true, width: 50, resizable: false, sortable: false, },
        {
          headerName: 'Дата платежа', field: 'payment_date', flex: 0.5,
          cellRenderer: params => cellRendererInput(params, getFormattedDate, 'calendar')
        },
        {
          headerName: 'Сумма', field: 'amount', flex: 0.5,
          cellRenderer: params => {
            const span = document.createElement('span')
            span.classList.add('table-span-price')
            span.innerHTML = params.value ? formattingPrice(params.value) : 'нет'
            return cellRendererInput(params, undefined, null, span)
          }
        },
        {
          headerName: 'ФИО', field: 'fullname', flex: 1,
          cellRenderer: params => cellRendererInput(params, undefined, 'profile')
        },
        {
          headerName: 'Договор', field: 'agrid', flex: 0.5,
          cellRenderer: params => {
            const span = document.createElement('span')
            span.classList.add('table-span-agrid')
            span.textContent = params.value ? addPrefixToNumbers(params.value) : 'нет'
            return cellRendererInput(params, undefined, null, span)
          }
        },
        {
          headerName: 'Вид поступления', field: 'type', flex: 0.5,
        },
        {
          headerName: 'Физ./Юр.', field: 'user_type', flex: 0.5,
          valueFormatter: params => params.value === 'f' ? 'Физ. лицо' : 'Юр. лицо'
        },
        {
          headerName: 'Действия', field: 'actions', flex: 0.3, resizable: false, sortable: false,
          cellRenderer: params => this.actionCellRenderer(params),
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
  }

  actionCellRenderer(params) {
    const { agrid, user_type } = params.data
    const row = params.eGridCell.closest('.ag-row')
    const button = document.createElement('button');
    button.classList.add('button-table-actions');
    button.setAttribute('data-agr-id', agrid)
    button.setAttribute('data-user-type', user_type)
    button.innerHTML = `<span></span><span></span><span></span><svg class='icon icon-check'><use xlink:href='img/svg/sprite.svg#check'></use></svg>`;
    let form

    const tippyInstance = actions(button)

    tippyInstance.options.onEdit = instance => {
      this.validatorRow?.revalidate().then(isValid => {
        if (isValid) {
          const formData = new FormData(form)
          let data = {}
          formData.set('payment_date', getFormattedDate(formData.get('payment_date'), 'YYYY-MM-DD'))
          Array.from(formData).forEach(obj => data[obj[0]] = obj[1])

          this.editPayment(data).finally(() => {
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
      const inputsObj = {}

      inputs.forEach(input => {
        const inputClone = input.cloneNode(true);
        inputClone.value = input.value; // Установить начальное значение
        inputsObj[input.name] = input
        form.appendChild(inputClone);

        // Обработчик событий для синхронизации значений
        input.addEventListener('input', () => {
          inputClone.value = input.value
          this.validatorRow?.revalidateField(inputClone).then(isValid => {
            input.value = inputClone.value // обратная синхронизация после валидации клона
            if (isValid) {
              input.classList.remove('just-validate-error-field')
            } else {
              input.classList.add('just-validate-error-field')
            }
          })
        });
      });

      this.validatorRow = validateRow(form, { inputsObj })
    }

    return button
  }

  render(data) {
    const { payments, cnt_pages, page } = data;
    this.setPage(page, cnt_pages)
    this.gridApi.setGridOption('rowData', payments)
    this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 20, payments.length])
  }

  async editPayment(data) {
    try {
      this.loader.enable()
      const response = await api.post('/_edit_payment_', data)
      if (response.status !== 200) return
      outputInfo(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default TablePayments