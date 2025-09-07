import Table from '../Table.js';
import { addPrefixToNumbers } from '../utils/addPrefixToNumbers.js';
import { createElement } from '../../../settings/createElement.js';
import { getFormattedDate } from '../../../utils/getFormattedDate.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { api } from '../../../settings/api.js';

class TablePlan extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: '',
          width: 40,
          resizable: false,
          sortable: false,
          cellRenderer: ({ data, rowIndex, node, eGridCell }) => {
            const buttonEdit = createElement('button', {
              content: `<img src="./img/svg/tabler_edit.svg">`
            })
            buttonEdit.className = `btn-edit w-7 h-7 flex items-center justify-center border border-solid border-[#ecedef] hover:bg-[#f5f6f7]`

            const buttonCancel = createElement('button', {
              content: `<img src="./img/svg/material-symbols_close.svg">`

            })
            buttonCancel.className = 'btn-cancel w-6 h-6 flex items-center justify-center bg-[#ecedef] hover:bg-[#d3d5d6] border border-solid border-[#ecedef] hidden'

            const buttonSave = createElement('button', {
              content: `<img src="./img/svg/material-symbols_save-outline.svg">`
            })
            buttonSave.className = 'btn-save w-6 h-6 flex items-center justify-center bg-[#ecedef] hover:bg-[#d3d5d6] border border-solid border-[#ecedef] hidden'

            const wp = createElement('div', {
              content: [buttonEdit, buttonSave, buttonCancel]
            })
            wp.className = 'flex flex-col gap-1 items-center justify-center'

            eGridCell.style.padding = '5px'

            buttonEdit.addEventListener('click', () => this.enableRowEdit(node.id));
            buttonSave.addEventListener('click', () => this.saveRowData(node.id));
            buttonCancel.addEventListener('click', () => this.cancelRowEdit(node.id));

            return wp;
          },
        },
        {
          headerName: 'Дата',
          field: 'data',
          minWidth: 120,
          flex: 0.1,
          valueFormatter: params => getFormattedDate(params.value)
        },
        {
          headerName: 'Выручка план нарастающим итогом',
          field: 'revenue_accumulated_planned',
          minWidth: 120,
          flex: 0.1,
          cellRenderer: params => {
            this.addHandleDbClickCell(params);
            return cellRendererInput(params, {
              // el: span,
              funcFormate: value => formattingPrice(value.toFixed(0)),
              inputmode: 'numeric'
            });
          }
        },
        {
          headerName: 'Выручка факт нарастающим итогом',
          field: 'revenue_accumulated',
          minWidth: 120,
          flex: 0.1,
          valueFormatter: params => formattingPrice(params.value)
        },
        {
          headerName: 'Выручка в день',
          field: 'revenue',
          minWidth: 120,
          flex: 0.1,
          valueFormatter: params => formattingPrice(params.value)
        },
        {
          headerName: '% выполнения',
          minWidth: 120,
          flex: 0.1,
          cellRenderer: ({ data }) => {
            const rate = (data.revenue_accumulated / data.revenue_accumulated_planned * 100).toFixed(0)
            const p = createElement('p', {
              classes: ['flex', 'gap-1', 'items-center'],
              content: `<img src="./img/svg/${rate >= 100 ? 'ion_checkmark-done-circle.svg' : 'carbon_close-filled.svg'}" class="shrink-0">
              <span>${rate}%</span>`
            });

            return p;
          }
        },
        {
          headerName: 'Заполнение план нарастающим итогом',
          field: 'inflow_area_accumulated_planned',
          minWidth: 120,
          flex: 0.1,
          cellRenderer: params => {
            this.addHandleDbClickCell(params);
            return cellRendererInput(params, {
              inputmode: 'decimal'
            });
          }
        },
        {
          headerName: 'Заполнение факт общий нарастающим',
          field: 'inflow_area_accumulated',
          minWidth: 120,
          flex: 0.1,
        },
        {
          headerName: 'Заполнение в день, м2',
          field: 'inflow_area',
          minWidth: 120,
          flex: 0.1,
        },
        {
          headerName: '% выполнения',
          minWidth: 120,
          flex: 0.1,
          cellRenderer: ({ data }) => {
            const rate = (data.inflow_area_accumulated / data.inflow_area_accumulated_planned * 100).toFixed(0)
            const p = createElement('p', {
              classes: ['flex', 'gap-1', 'items-center'],
              content: `<img src="./img/svg/${rate < 100 || rate === 'Infinity' || rate === "NaN"
                ? 'carbon_close-filled.svg'
                : 'ion_checkmark-done-circle.svg'}" class="shrink-0">
              <span>${rate === 'NaN' || rate === 'Infinity' ? "0" : rate}%</span>`
            });

            return p;
          }
        },
        {
          headerName: 'Лиды план нарастающим итогом',
          field: 'leads_accumulated_planned',
          minWidth: 120,
          flex: 0.1,
          cellRenderer: params => {
            this.addHandleDbClickCell(params);
            return cellRendererInput(params, {
              inputmode: 'numeric'
            });
          }
        },
        {
          headerName: 'Лидов факт общий нарастающим',
          field: 'leads_accumulated_fact',
          minWidth: 120,
          flex: 0.1,
        },
        {
          headerName: 'Лиды в день',
          field: 'leads_fact',
          minWidth: 120,
          flex: 0.1,
          cellRenderer: params => {
            this.addHandleDbClickCell(params);
            return cellRendererInput(params, {
              inputmode: 'numeric'
            });
          }
        },
        {
          headerName: '% выполнения ОБЩИЙ',
          minWidth: 120,
          flex: 0.1,
          cellRenderer: ({ data }) => {
            const rate = (data.leads_accumulated_fact / data.leads_accumulated_planned * 100).toFixed(0)
            const p = createElement('p', {
              classes: ['flex', 'gap-1', 'items-center'],
              content: `<img src="./img/svg/${rate < 100 || rate === "NaN" || rate === 'Infinity'
                ? 'carbon_close-filled.svg'
                : 'ion_checkmark-done-circle.svg'}" class="shrink-0">
              <span>${rate === 'NaN' || rate === 'Infinity' ? 0 : rate}%</span>`
            });

            return p;
          }
        },
      ],
      pagination: false
    };

    const defaultParams = {
      isPagination: false
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);
    super(selector, mergedOptions, mergedParams);

    this.editableFields = [
      'revenue_accumulated_planned',
      'inflow_area_accumulated_planned',
      'leads_accumulated_planned',
      'leads_fact'
    ];

    // Для хранения оригинальных значений при редактировании
    this.originalRowData = new Map();
  }

  enableRowEdit(rowId) {
    const row = this.wpTable.querySelector(`[row-id="${rowId}"]`);
    if (!row) return;

    const rowNode = this.gridApi.getRowNode(rowId);

    // Сохраняем оригинальные данные
    this.originalRowData.set(rowId, { ...rowNode.data });

    // Переключаем кнопки
    const btnEdit = row.querySelector('.btn-edit');
    const btnSave = row.querySelector('.btn-save');
    const btnCancel = row.querySelector('.btn-cancel');

    btnEdit.classList.add('hidden');
    btnSave.classList.remove('hidden');
    btnCancel.classList.remove('hidden');

    // Включаем редактирование для нужных полей
    this.editableFields.forEach(fieldName => {
      const input = row.querySelector(`input[name="${fieldName}"]`);
      if (input) {
        this.changeReadonly(input, false);
      }
    });
  }

  addHandleDbClickCell(params) {
    params.eGridCell.addEventListener('dblclick', e => {
      // const row = params.eGridCell.closest('.ag-row');
      const input = e.target.closest('input');
      if (input.classList.contains('not-edit')) {
        this.enableRowEdit(params.node.id)
      }
    });
  }

  cancelRowEdit(rowId) {
    const row = this.wpTable.querySelector(`[row-id="${rowId}"]`);
    if (!row) return;

    const rowNode = this.gridApi.getRowNode(rowId);
    const originalData = this.originalRowData.get(rowId);

    if (originalData) {
      // Восстанавливаем оригинальные данные
      rowNode.setData(originalData);
      this.originalRowData.delete(rowId);
    }

    // Переключаем кнопки
    const btnEdit = row.querySelector('.btn-edit');
    const btnSave = row.querySelector('.btn-save');
    const btnCancel = row.querySelector('.btn-cancel');

    btnEdit.classList.remove('hidden');
    btnSave.classList.add('hidden');
    btnCancel.classList.add('hidden');

    // Отключаем редактирование
    this.editableFields.forEach(fieldName => {
      const input = row.querySelector(`input[name="${fieldName}"]`);
      if (input) {
        this.changeReadonly(input, true);
        // Обновляем значение в input
        if (originalData && originalData[fieldName] !== undefined) {
          input.value = typeof originalData[fieldName] === 'number'
            ? originalData[fieldName].toString()
            : originalData[fieldName];
        }
      }
    });
  }

  async saveRowData(rowId) {
    const row = this.wpTable.querySelector(`[row-id="${rowId}"]`);

    if (!row) return;

    const rowNode = this.gridApi.getRowNode(rowId);

    // Собираем измененные данные
    const updatedData = {};
    let hasChanges = false;

    this.editableFields.forEach(fieldName => {
      const input = row.querySelector(`input[name="${fieldName}"]`);
      if (input) {
        const newValue = input.value.replace(/\s/g, '');
        const numericValue = newValue ? parseFloat(newValue) : 0;

        if (numericValue !== rowNode.data[fieldName]) {
          updatedData[fieldName] = numericValue;
          hasChanges = true;
        }
      }
    });

    if (!hasChanges) {
      this.cancelRowEdit(rowId);
      return;
    }
    try {
      // Вызываем метод сохранения данных
      await this.setFinancePlan({
        ...updatedData,
        data: rowNode.data.data,
        warehouse_id: window.app?.warehouse?.warehouse_id,
        month_or_day: 'day',
      });

      // Обновляем данные в таблице
      Object.keys(updatedData).forEach(field => {
        rowNode.setDataValue(field, updatedData[field]);
      });

      // Переключаем кнопки и отключаем редактирование
      const btnEdit = row.querySelector('.btn-edit');
      const btnSave = row.querySelector('.btn-save');
      const btnCancel = row.querySelector('.btn-cancel');

      btnEdit.classList.remove('hidden');
      btnSave.classList.add('hidden');
      btnCancel.classList.add('hidden');

      this.editableFields.forEach(fieldName => {
        const input = row.querySelector(`input[name="${fieldName}"]`);
        if (input) {
          this.changeReadonly(input, true);
        }
      });

      // Удаляем сохраненные оригинальные данные
      this.originalRowData.delete(rowId);
    } catch (error) {
      console.error('Ошибка при сохранении:', error);

      if (window.app?.notify?.show) {
        window.app.notify.show({ message: 'Ошибка при сохранении данных', type: 'error' });
      }
    }
  }

  async setFinancePlan(data) {
    try {
      this.loader.enable();
      console.log(data)

      const response = await api.post('/_set_finance_plan_', data);
      if (response.status !== 200) {
        throw new Error('Ошибка сервера');
      }
      if (response.data && window.app?.notify?.show) {
        window.app.notify.show(response.data);
      }
    } catch (error) {
      throw error;
    } finally {
      this.loader.disable();
    }
  }

  onRendering({ finance_planfact }) {
    this.gridApi.setGridOption('rowData', finance_planfact);
  }
}

export default TablePlan;