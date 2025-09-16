import Table from '../Table.js';
import { HeaderSync } from './HeaderSync.js';
import { RowDetailRenderer } from './RowDetailRenderer.js';
import { addPrefixToNumbers } from '../utils/addPrefixToNumbers.js';
import { createElement } from '../../../settings/createElement.js';
import { getFormattedDate } from '../../../utils/getFormattedDate.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { api } from '../../../settings/api.js';

class TablePlan extends Table {
  constructor(selector, options, params) {
    // Колонка с кнопкой аккордеона (только для warehouse_id === 0)
    const accordionColumn = window.app?.warehouse?.warehouse_id === 0 ? [{
      headerName: '',
      width: 30,
      resizable: false,
      sortable: false,
      pinned: 'left',
      cellRenderer: ({ data, rowIndex, node, eGridCell }) => {
        // Не показываем кнопку для детальных строк
        if (data._isDetail) {
          return '';
        }

        const buttonExpand = createElement('button', {
          content: `<svg width="15" height="15" viewBox="0 0 4 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.75 2.74951H2.25V4.24951H1.75V2.74951H0.25V2.24951H1.75V0.749512H2.25V2.24951H3.75V2.74951Z" fill="#787B80" />
                    </svg>`,
          attributes: [['data-row-id', node.id]]
        });
        buttonExpand.className = 'btn-accordion w-5 h-5 border border-solid border-[#ecedef] hover:bg-[#f5f6f7] shrink-0 flex items-center justify-center m-auto';

        eGridCell.style.padding = '3px';
        eGridCell.style.textAlign = 'center';

        buttonExpand.addEventListener('click', () => this.toggleAccordion(node.id, buttonExpand));

        return buttonExpand;
      }
    }] : [];

    const defaultOptions = {
      headerHeight: 90,
      columnDefs: [
        ...accordionColumn,
        {
          headerName: '',
          width: 40,
          resizable: false,
          sortable: false,
          pinned: 'left',
          cellRenderer: ({ data, rowIndex, node, eGridCell }) => {
            // Скрываем кнопки редактирования для детальных строк
            if (data._isDetail) {
              return '';
            }

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
            wp.className = 'w-full flex flex-col gap-1 items-center justify-center'

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
          minWidth: 85,
          flex: 0.01,
          cellRenderer: ({ value, data, eGridCell }) => {
            const span = createElement('span', {
              content: value || ''
            });

            if (data._isDetail) {
              span.style.color = '#6b7280';
              eGridCell.style.left = '0'
            } else {
              span.textContent = value ? getFormattedDate(value) : '';
            }

            span.style.paddingLeft = '5px';

            return span;
          }
        },
        {
          headerName: 'Выручка план нарастающим итогом',
          headerClass: 'header-wrap',
          field: 'revenue_accumulated_planned',
          minWidth: 120,
          flex: 0.1,
          cellRenderer: params => {
            if (params.data._isDetail) {
              // Для детальных строк просто показываем отформатированное значение
              return params.value ? formattingPrice(params.value) : '—';
            }
            this.addHandleDbClickCell(params);
            return cellRendererInput(params, {
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
          valueFormatter: params => {
            return params.value ? formattingPrice(params.value) : '—';
          }
        },
        {
          headerName: 'Выручка в день',
          field: 'revenue',
          minWidth: 100,
          flex: 0.1,
          valueFormatter: params => {
            return params.value ? formattingPrice(params.value) : '—';
          }
        },
        {
          headerName: '% выполнения',
          minWidth: 100,
          flex: 0.1,
          cellRenderer: ({ data }) => {
            if (!data.revenue_accumulated_planned || data.revenue_accumulated_planned === 0) {
              return '—';
            }
            const rate = (data.revenue_accumulated / data.revenue_accumulated_planned * 100).toFixed(0);
            const isGood = rate >= 100;

            const p = createElement('p', {
              classes: ['flex', 'gap-1', 'items-center'],
              content: `<img src="./img/svg/${isGood ? 'ion_checkmark-done-circle.svg' : 'carbon_close-filled.svg'}" class="shrink-0">
              <span>${rate}%</span>`
            });

            if (data._isDetail) {
              p.style.opacity = '0.8'; // Немного приглушаем для детальных строк
            }
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
            if (params.data._isDetail) {
              // Для детальных строк просто показываем значение
              return params.value ? params.value.toFixed(1) : '—';
            }
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
          valueFormatter: params => {
            return params.value !== null && params.value !== undefined ? params.value : '—';
          }
        },
        {
          headerName: 'Заполнение в день, м2',
          field: 'inflow_area',
          headerClass: 'header-wrap',
          minWidth: 100,
          flex: 0.1,
          valueFormatter: params => {
            return params.value !== null && params.value !== undefined ? params.value : '—';
          }
        },
        {
          headerName: '% выполнения',
          minWidth: 100,
          flex: 0.1,
          cellRenderer: ({ data }) => {
            if (!data.inflow_area_accumulated_planned || data.inflow_area_accumulated_planned === 0) {
              return '—';
            }
            const rate = (data.inflow_area_accumulated / data.inflow_area_accumulated_planned * 100).toFixed(0);
            const isValid = !isNaN(rate) && isFinite(rate);
            const isGood = isValid && parseInt(rate) >= 100;

            const p = createElement('p', {
              classes: ['flex', 'gap-1', 'items-center'],
              content: `<img src="./img/svg/${isGood ? 'ion_checkmark-done-circle.svg' : 'carbon_close-filled.svg'}" class="shrink-0">
              <span>${!isValid ? "0" : rate}%</span>`
            });

            if (data._isDetail) {
              p.style.opacity = '0.8';
            }
            return p;
          }
        },
        {
          headerName: 'Лиды план нарастающим итогом',
          field: 'leads_accumulated_planned',
          headerClass: 'header-wrap',
          minWidth: 100,
          flex: 0.1,
          cellRenderer: params => {
            if (params.data._isDetail) {
              return params.value !== null && params.value !== undefined ? params.value : '—';
            }
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
          minWidth: 100,
          flex: 0.1,
          valueFormatter: params => {
            return params.value !== null && params.value !== undefined ? params.value : '—';
          }
        },
        {
          headerName: 'Лиды в день',
          field: 'leads_fact',
          minWidth: 100,
          flex: 0.1,
          cellRenderer: params => {
            if (params.data._isDetail) {
              return params.value !== null && params.value !== undefined ? params.value : '—';
            }
            this.addHandleDbClickCell(params);
            return cellRendererInput(params, {
              inputmode: 'numeric'
            });
          }
        },
        {
          headerName: '% выполнения ОБЩИЙ',
          headerClass: 'header-wrap',
          minWidth: 100,
          flex: 0.1,
          resizable: false,
          cellRenderer: ({ data }) => {
            if (!data.leads_accumulated_planned || data.leads_accumulated_planned === 0) {
              return '—';
            }
            const rate = (data.leads_accumulated_fact / data.leads_accumulated_planned * 100).toFixed(0);
            const isValid = !isNaN(rate) && isFinite(rate);
            const isGood = isValid && parseInt(rate) >= 100;

            const p = createElement('p', {
              classes: ['flex', 'gap-1', 'items-center'],
              content: `<img src="./img/svg/${isGood ? 'ion_checkmark-done-circle.svg' : 'carbon_close-filled.svg'}" class="shrink-0">
              <span>${!isValid ? "0" : rate}%</span>`
            });

            if (data._isDetail) {
              p.style.opacity = '0.8';
            }
            return p;
          }
        },
      ],
      // Функция для определения высоты строки
      getRowHeight: params => {
        // Используем одинаковую высоту для всех строк
        return 60;
      },
      // Отключаем возможность выбора детальных строк
      isRowSelectable: params => {
        return !params.data._isDetail;
      },
      pagination: false,
      onColumnResized: params => {
        this.headerSync?.syncWidths(params.api);
      },
      // Добавляем CSS класс для детальных строк
      getRowClass: params => {
        if (params.data._isDetail) {
          return 'detail-row';
        }
        return '';
      }
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

    // Инициализируем RowDetailRenderer
    this.detailRenderer = null;

    this.onReadyFunctions.push(() => {
      this.headerSync = new HeaderSync(this.wpTable, this.gridApi);
      setTimeout(() => this.headerSync.init(), 100);

      // Создаем detailRenderer после инициализации gridApi
      this.detailRenderer = new RowDetailRenderer(this.gridApi, this.getDetailDataForRow.bind(this));
    });
  }

  /**
   * Переключает аккордеон (раскрытие/сворачивание строки)
   */
  toggleAccordion(rowId, btn) {
    const rowNode = this.gridApi.getRowNode(rowId);
    if (!rowNode || !this.detailRenderer) return;

    // Если идет редактирование - сначала отменяем его
    if (this.originalRowData.size > 0) {
      this.originalRowData.forEach((data, id) => {
        this.cancelRowEdit(id);
      });
    }

    this.detailRenderer.toggle(rowNode, btn);
  }

  /**
   * Метод для получения детальных данных
   * В реальном приложении здесь должен быть API запрос
   */
  async getDetailDataForRow(rowData) {
    try {
      this.loader.enable();
      let data = []

      for (const { warehouse_id, warehouse_short_name } of this.app.warehouses) {
        if (warehouse_id === 0) continue

        const { finance_planfact = [] } = await this.getData({
          start_date: rowData.data,
          end_date: rowData.data,
          warehouse_id
        })

        if (finance_planfact.length) {
          data.push({ ...finance_planfact[0], data: warehouse_short_name })
        }
      }

      return data
    } catch (error) {
      console.log(error)
    } finally {
      this.loader.disable();
    }
  }

  async enableRowEdit(rowId) {
    // Сначала сворачиваем все аккордеоны
    if (this.detailRenderer && this.detailRenderer.expandedRowId) {
      this.detailRenderer.collapseAll();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const centerColsViewport = this.wpTable.querySelector('.ag-center-cols-viewport')
    const pinnedLeftColsContainer = this.wpTable.querySelector('.ag-pinned-left-cols-container')

    if (!centerColsViewport || !pinnedLeftColsContainer) {
      console.warn('Не удалось найти обертку строк или обертку пинов')
      return
    }

    const row = centerColsViewport.querySelector(`[row-id="${rowId}"]`);
    if (!row) {
      console.warn('Не удалось найти строку')
      return
    };

    const pinnedRow = pinnedLeftColsContainer.querySelector(`.ag-row[row-id="${rowId}"]`)

    if (!pinnedRow) {
      console.warn('Не удалось найти пин строку')
      return
    }

    const rowNode = this.gridApi.getRowNode(rowId);

    // Не разрешаем редактирование детальных строк
    if (rowNode.data._isDetail) return;

    // Сохраняем оригинальные данные
    this.originalRowData.set(rowId, { ...rowNode.data });

    // Переключаем кнопки
    const btnEdit = pinnedRow.querySelector('.btn-edit');
    const btnSave = pinnedRow.querySelector('.btn-save');
    const btnCancel = pinnedRow.querySelector('.btn-cancel');

    if (!btnEdit || !btnSave || !btnCancel) {
      console.warn('Не удалось найти кнопки')
      return
    };

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
    // Не добавляем обработчик для детальных строк
    if (params.data._isDetail) return;

    params.eGridCell.addEventListener('dblclick', e => {
      const input = e.target.closest('input');
      if (input && input.classList.contains('not-edit')) {
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

    if (btnEdit && btnSave && btnCancel) {
      btnEdit.classList.remove('hidden');
      btnSave.classList.add('hidden');
      btnCancel.classList.add('hidden');
    }

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
    const centerColsViewport = this.wpTable.querySelector('.ag-center-cols-viewport')
    const row = centerColsViewport.querySelector(`[row-id="${rowId}"]`);
    if (!row) return;

    const rowNode = this.gridApi.getRowNode(rowId);

    // Не сохраняем детальные строки
    if (rowNode.data._isDetail) return;

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

      const pinnedLeftColsContainer = this.wpTable.querySelector('.ag-pinned-left-cols-container')

      // Переключаем кнопки и отключаем редактирование
      const btnEdit = pinnedLeftColsContainer.querySelector('.btn-edit');
      const btnSave = pinnedLeftColsContainer.querySelector('.btn-save');
      const btnCancel = pinnedLeftColsContainer.querySelector('.btn-cancel');

      btnEdit?.classList.remove('hidden');
      btnSave?.classList.add('hidden');
      btnCancel?.classList.add('hidden');

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
        window.app.notify.show({ msg: 'Ошибка при сохранении данных', type: 'error' });
      }
    }
  }

  async setFinancePlan(data) {
    try {
      this.loader.enable();
      console.log('Saving finance plan:', data);

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
    // Сохраняем состояние раскрытых строк перед обновлением
    const expandedRowId = this.detailRenderer?.expandedRowId;

    // Фильтруем детальные строки из новых данных
    const filteredData = finance_planfact.filter(row => !row._isDetail);

    this.gridApi.setGridOption('rowData', filteredData);

    // Восстанавливаем раскрытые строки после обновления
    if (expandedRowId && this.detailRenderer) {
      setTimeout(() => {
        const rowNode = this.gridApi.getRowNode(expandedRowId);
        const button = document.querySelector(`[row-id="${expandedRowId}"] .btn-accordion`);
        if (rowNode && button) {
          this.detailRenderer.expand(rowNode, button);
        }
      }, 100);
    }

    setTimeout(() => this.headerSync?.syncWidths(this.gridApi), 50);
  }

  /**
   * Метод для программного раскрытия строки
   */
  expandRow(rowId) {
    if (!this.detailRenderer) return;

    const rowNode = this.gridApi.getRowNode(rowId);
    const button = document.querySelector(`[row-id="${rowId}"] .btn-accordion`);

    if (rowNode && button && !this.detailRenderer.isExpanded(rowId)) {
      this.detailRenderer.expand(rowNode, button);
    }
  }
}

export default TablePlan;