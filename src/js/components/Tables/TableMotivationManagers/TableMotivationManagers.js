import Table from '../Table.js';

import { api } from '../../../settings/api.js';

import { actions } from '../utils/actions.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { observeCell } from '../utils/observeCell.js';
import { createElement } from '../../../settings/createElement.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { cellDatePicker } from '../TablesForecast/utils/cellDatePicker.js';

class TableMotivationManagers extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Месяц',
          field: 'month',
          minWidth: 120,
          flex: 1,
          valueFormatter: params => params.value ? dateFormatter(params.value, 'MMMM yyyy') : '',
          cellRenderer: params => {
            const el = cellRendererInput(params, {
              funcFormate: value => value ? dateFormatter(value, 'MMMM yyyy') : ''
            });

            if (!params.value && params.data.isNew) {
              // Для новых строк инициализируем текущий месяц
              const currentDate = new Date();
              currentDate.setDate(1);
              params.data.month = dateFormatter(currentDate, 'yyyy-MM');
              params.setValue(params.data.month);
            }

            const input = el.querySelector('input');
            if (input) {
              cellDatePicker(input, {
                params,
                prefixClass: 'table-motivation-managers',
                hasDay: false
              });
            }

            this.addHandleDbClickCell(params);
            return el;
          }
        },
        {
          headerName: 'Оклад',
          field: 'oklad',
          minWidth: 100,
          flex: 1,
          valueFormatter: params => params.value ? formattingPrice(params.value) : '',
          cellRenderer: params => {
            const el = cellRendererInput(params, {
              funcFormate: formattingPrice,
              inputmode: 'numeric'
            });
            this.addHandleDbClickCell(params);
            return el;
          }
        },
        {
          headerName: 'Градация от',
          field: 'gradation_start',
          minWidth: 100,
          flex: 1,
          valueFormatter: params => params.value ? formattingPrice(params.value) : '',
          cellRenderer: params => {
            const el = cellRendererInput(params, {
              funcFormate: formattingPrice,
              inputmode: 'numeric'
            });
            this.addHandleDbClickCell(params);
            return el;
          }
        },
        {
          headerName: 'Градация до',
          field: 'gradation_end',
          minWidth: 100,
          flex: 1,
          valueFormatter: params => params.value ? formattingPrice(params.value) : '',
          cellRenderer: params => {
            const el = cellRendererInput(params, {
              funcFormate: formattingPrice,
              inputmode: 'numeric'
            });
            this.addHandleDbClickCell(params);
            return el;
          }
        },
        {
          headerName: '% бонуса',
          field: 'bonus_percent',
          minWidth: 100,
          flex: 1,
          valueFormatter: params => params.value ? params.value + '%' : '',
          cellRenderer: params => {
            const el = cellRendererInput(params, {
              funcFormate: value => value ? value + '%' : '',
              inputmode: 'numeric'
            });
            this.addHandleDbClickCell(params);
            return el;
          }
        },
        {
          headerName: 'Действия',
          field: 'actions',
          width: 120,
          resizable: false,
          sortable: false,
          floatingFilter: false,
          filter: null,
          cellRenderer: (params) => {
            // Показываем кнопки только для новых строк
            if (!params.data.isNew) {
              return '';
            }
            params.eParentOfValue.style.justifyContent = 'center';

            const wrapper = createElement('div', {
              classes: ['actions-buttons'],
              attributes: [['style', 'display: flex; gap: 5px; align-items: center; justify-content: center;']]
            });

            // Кнопка удаления
            const btnDelete = createElement('button', {
              classes: ['btn-delete', 'hover:bg-[#f5f6f7]'],
              attributes: [['style', 'padding: 5px; border: 1px solid #ecedef; border-radius: 4px; cursor: pointer;']],
              content: `<svg class="icon icon-plus" style="width: 14px; height: 14px; transform: rotate(45deg); fill: #A9AFB9;"><use xlink:href="#plus"></use></svg>`
            });

            btnDelete.addEventListener('click', () => {
              params.api.applyTransaction({ remove: [params.data] });
            });

            // Кнопка сохранения
            const btnSave = createElement('button', {
              classes: ['btn-save', 'hover:bg-[#f5f6f7]'],
              attributes: [['style', 'padding: 5px; border: 1px solid #ecedef; border-radius: 4px; cursor: pointer;']],
              content: `<svg class="icon icon-dow" style="width: 14px; height: 14px;"><use xlink:href="#dow"></use></svg>`
            });

            btnSave.addEventListener('click', () => {
              this.handleClickBtnSave(params);
            });

            wrapper.appendChild(btnDelete);
            wrapper.appendChild(btnSave);

            return wrapper;
          }
        }
      ]
    };

    const defaultParams = {
      isPagination: false,
      onChangeTypeUser: () => { }
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);
    super(selector, mergedOptions, mergedParams);
  }

  onRendering({ motivation_info = [], }) {
    this.gridApi.setGridOption('rowData', motivation_info);
  }

  beforeAddRow(emptyRow) {
    // Инициализируем значения по умолчанию для новой строки
    const currentDate = new Date();
    currentDate.setDate(1);

    return {
      ...emptyRow,
      month: dateFormatter(currentDate, 'yyyy-MM'),
      oklad: '',
      gradation_start: '',
      gradation_end: '',
      bonus_percent: '',
      isNew: true
    };
  }

  afterAddRow({ data, element }) {
    // Делаем инпуты редактируемыми для новой строки
    const inputs = element.querySelectorAll('select, input');

    inputs.length && inputs.forEach(input => {
      this.changeReadonly(input, false);
    });
  }

  addHandleDbClickCell({ eGridCell }) {
    eGridCell.addEventListener('dblclick', e => {
      const row = eGridCell.closest('.ag-row');
      const wp = eGridCell.querySelector('.wp-input-cell');

      if (wp && wp.classList.contains('not-edit')) {
        const input = wp.querySelector('input') || wp.querySelector('select');
        if (input) {
          this.changeReadonly(input, false);
        }
      }
    });
  }

  handleClickBtnSave(params) {
    const { node, api, data } = params;
    const rowNode = node;

    if (!rowNode) return;

    const rowElement = this.wpTable.querySelector(`.ag-row[row-id="${rowNode.id}"]`);
    if (!rowElement) return;

    const inputs = rowElement.querySelectorAll('input');
    let isValid = true;
    const updatedData = { ...data };

    inputs.length && inputs.forEach(input => {
      const fieldName = input.name;
      let value = input.value;

      // Обработка специальных полей
      if (fieldName === 'month' && input.dataset.value) {
        value = input.dataset.value;
      } else if (fieldName === 'oklad' || fieldName === 'gradation_start' || fieldName === 'gradation_end') {
        value = value ? parseFloat(value.replace(/\s/g, '').replace(',', '.')) : '';
      } else if (fieldName === 'bonus_percent') {
        value = value ? parseFloat(value.replace('%', '').replace(/\s/g, '').replace(',', '.')) : '';
      }

      updatedData[fieldName] = value;

      // Валидация обязательных полей
      if (!value && (fieldName === 'month' || fieldName === 'oklad' || fieldName === 'gradation_start' || fieldName === 'gradation_end' || fieldName === 'bonus_percent')) {
        input.classList.add('_err');
        isValid = false;
      } else {
        input.classList.remove('_err');
      }
    });

    if (!isValid) {
      this.app.notify.show({ msg: 'Заполните все обязательные поля', msg_type: 'warning' });
      return;
    }

    // Сохраняем данные локально (пока без запросов к серверу)
    updatedData.isNew = false;

    // Обновляем данные в строке
    rowNode.setData(updatedData);

    // Делаем инпуты readonly
    inputs.length && inputs.forEach(input => {
      this.changeReadonly(input, true);
    });

    // Обновляем отображение строки
    api.refreshCells({
      rowNodes: [rowNode],
      force: true
    });

    this.app.notify.show({ msg: 'Строка сохранена', msg_type: 'success' });
  }

  async editMotivationManager(data) {
    try {
      this.loader.enable();
      const response = await api.post('/_set_motivation_info_', data);
      if (response.status !== 200) return;
      this.app.notify.show(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      this.loader.disable();
    }
  }
}

export default TableMotivationManagers;
