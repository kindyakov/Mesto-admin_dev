import Table from '../Table.js';
import { addPrefixToNumbers } from '../utils/addPrefixToNumbers.js';
import { createElement } from '../../../settings/createElement.js';
import { getFormattedDate } from '../../../utils/getFormattedDate.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { api } from '../../../settings/api.js';
import { HeaderSync } from './HeaderSync.js';


class TablePlan extends Table {
  constructor(selector, options, params) {
    const accordionColumn = window.app?.warehouse?.warehouse_id === 0 ? [{
      headerName: '',
      width: 30,
      resizable: false,
      sortable: false,
      pinned: 'left',
      cellRenderer: ({ data, rowIndex, node, eGridCell }) => {
        const buttonExpand = createElement('button', {
          content: `<svg width="15" height="15" viewBox="0 0 4 5" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3.75 2.74951H2.25V4.24951H1.75V2.74951H0.25V2.24951H1.75V0.749512H2.25V2.24951H3.75V2.74951Z" fill="#787B80" />
</svg>`
        });
        buttonExpand.className = 'btn-accordion w-5 h-5 border border-solid border-[#ecedef] hover:bg-[#f5f6f7] shrink-0 flex items-center justify-center';

        eGridCell.style.padding = '3px';
        eGridCell.style.textAlign = 'center';

        buttonExpand.addEventListener('click', () => this.toggleAccordion(node.id, buttonExpand));

        return buttonExpand;
      }
    }] : [];

    const defaultOptions = {
      headerHeight: 90,
      // masterDetail: true,
      // detailRowHeight: 190, // подогнать под содержимое
      // detailCellRenderer: (params) => {
      //   // params.data — исходная строка (master row)
      //   const detailRows = this.getDetailDataForRow(params.data) || [];

      //   // Если нет данных — вернуть простое сообщение
      //   if (!detailRows.length) {
      //     return createElement('div', {
      //       classes: ['detail-empty'],
      //       content: 'Деталей нет'
      //     });
      //   }

      //   // Собираем DOM — для каждой записи строим небольшую таблицу
      //   const content = detailRows.map(dr => {
      //     const rowsHtml = Object.keys(dr).map(key => {
      //       let value = dr[key];

      //       // Форматирование: даты и чисел
      //       if (key.toLowerCase().includes('date') || key === 'data') {
      //         value = getFormattedDate(value);
      //       } else if (typeof value === 'number' && (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('price') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('accumulated') || key.toLowerCase().includes('area') || key.toLowerCase().includes('leads'))) {
      //         // для чисел используем форматирование цен/чисел
      //         try {
      //           value = formattingPrice(value);
      //         } catch (e) {
      //           value = String(value);
      //         }
      //       } else {
      //         value = value === null || value === undefined ? '' : String(value);
      //       }

      //       // безопасный HTML — ключ и значение как текст
      //       return `<tr><td class="detail-key">${key}</td><td class="detail-val">${value}</td></tr>`;
      //     }).join('');

      //     return `<div class="detail-block"><table class="detail-table"><tbody>${rowsHtml}</tbody></table></div>`;
      //   }).join('');

      //   const wrapper = createElement('div', {
      //     classes: ['detail-container'],
      //     content: content
      //   });

      //   // немного стилей через JS — можно вынести в CSS-файл
      //   wrapper.style.padding = '8px 12px';
      //   wrapper.querySelectorAll && wrapper.querySelectorAll('.detail-table').forEach(tbl => {
      //     tbl.style.borderCollapse = 'collapse';
      //     tbl.style.width = '100%';
      //   });

      //   return wrapper;
      // },
      columnDefs: [
        ...accordionColumn,
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
          headerClass: 'header-wrap',
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
          headerClass: 'header-wrap',
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
          headerClass: 'header-wrap',
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
          headerClass: 'header-wrap',
          minWidth: 120,
          flex: 0.1,
        },
        {
          headerName: 'Заполнение в день, м2',
          field: 'inflow_area',
          headerClass: 'header-wrap',
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
          headerClass: 'header-wrap',
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
          headerClass: 'header-wrap',
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
          headerClass: 'header-wrap',
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
      pagination: false,
      onColumnResized: params => {
        this.headerSync?.syncWidths(params.api);
      },
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
    this.headerSync = null;

    this.onReadyFunctions.push(() => {
      this.headerSync = new HeaderSync(this.wpTable, this.gridApi);
      setTimeout(() => this.headerSync.init(), 100);
    })
  }

  toggleAccordion(rowId, button) {
    const rowNode = this.gridApi.getRowNode(rowId);
    const isExpanded = rowNode.expanded;

    if (isExpanded) {
      rowNode.setExpanded(false);
      button.classList.remove('expanded');
      button.querySelector('svg').style.transform = '';
    } else {
      // Закрываем все остальные
      this.gridApi.forEachNode(node => {
        if (node.expanded && node.id !== rowId) {
          node.setExpanded(false);
          const otherButton = this.wpTable.querySelector(`[row-id="${node.id}"] .btn-accordion`);
          if (otherButton) {
            otherButton.classList.remove('expanded');
            otherButton.querySelector('svg').style.transform = '';
          }
        }
      });

      // Открываем текущий
      rowNode.setExpanded(true);
      button.classList.add('expanded');
      button.querySelector('svg').style.transform = 'rotate(180deg)';
    }
  }

  // Метод для получения детальных данных:
  getDetailDataForRow(rowData) {
    // Здесь должна быть логика получения детальных данных
    // В зависимости от вашей структуры данных
    return [
      {
        "data": "Борисовские пруды",
        "inflow_area": 15,
        "inflow_area_accumulated": 15,
        "inflow_area_accumulated_planned": 10.3,
        "inflow_area_planned": 10.3,
        "leads_accumulated_fact": 13,
        "leads_accumulated_planned": 14,
        "leads_fact": 13,
        "leads_planned": 14,
        "outflow_area": 0,
        "outflow_area_accumulated": 0,
        "outflow_area_accumulated_planned": 0,
        "outflow_area_planned": 0,
        "reest_plan_accumulated": 18500,
        "reestr_plan": 18500,
        "rented_area": 4239,
        "rented_area_accumulated": 4239,
        "rented_area_accumulated_planned": 0,
        "rented_area_planned": 0,
        "revenue": 153632,
        "revenue_accumulated": 153632,
        "revenue_accumulated_planned": 103347,
        "revenue_new": 22634,
        "revenue_new_accumulated": 22634,
        "revenue_planned": 103347,
        "revenue_reestr": 118070,
        "revenue_reestr_accumulated": 118070
      }
    ];
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

    setTimeout(() => this.headerSync?.syncWidths(this.gridApi), 50);
  }
}

export default TablePlan;