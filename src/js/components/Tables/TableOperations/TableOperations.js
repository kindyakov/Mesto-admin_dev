import Table from '../Table.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { actions } from '../utils/actions.js';
import { renderTextHeader } from '../utils/renderTextHeader.js';
import { createElement } from '../../../settings/createElement.js';
import CustomFilter from '../utils/CustomFilter/CustomFilter.js';
import { createCalendar } from '../../../settings/createCalendar.js';

class TableOperations extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      getRowId: (params) => params.data.operation_id,
      columnDefs: [
        {
          headerName: 'Дата',
          field: 'operation_date',
          minWidth: 90,
          flex: 0.2,
          valueFormatter: params => dateFormatter(params.value)
        },
        {
          headerName: 'Склад',
          field: 'warehouse_id',
          minWidth: 80,
          flex: 0.1,
          valueFormatter: params => {
            let warehouse_name = '';
            this.app.warehouses.find(warehouse => {
              if (warehouse.warehouse_id === params.value) {
                warehouse_name = warehouse.warehouse_short_name;
                return true;
              }
            })
            return warehouse_name
          }
        },
        {
          headerName: 'Категория',
          field: 'category',
          minWidth: 100,
          flex: 0.3,
        },
        {
          headerName: 'Подкатегория',
          field: 'subcategory',
          minWidth: 100,
          flex: 0.3,
        },
        {
          headerName: 'Сумма платежа',
          field: 'amount',
          minWidth: 175,
          flex: 0.3,
          valueFormatter: params => formattingPrice(params.value)
        },
        {
          headerName: 'Комментарий',
          field: 'comment',
          minWidth: 100,
          flex: 0.3,
        },
        {
          headerName: 'Действия',
          field: 'actions',
          width: 90,
          resizable: false,
          sortable: false,
          filter: false,
          floatingFilter: false,
          cellRenderer: params => this.actionCellRenderer(params),
        }
      ],
      onFilterOpened: e => {
        const field = e.column.colDef.field;
        const filterWrapper = e.eGui.querySelector('.ag-filter-body-wrapper');
        const data = e.api.getGridOption('rowData');

        const uniqueSorted = arr => Array.from(new Set(arr)).sort((a, b) => {
          if (a > b) return 1;
          if (a < b) return -1;
          return 0;
        });

        const fullCurrentData = uniqueSorted((this.dataSource || []).map(obj => obj[field]));
        const currentData = uniqueSorted((data || []).map(obj => obj[field]));
        let dataWithoutCurrentFilter = [];

        if (this.queryParams?.filters) {
          const filtersKeys = Object.keys(this.queryParams.filters);
          if (filtersKeys.length === 1 && filtersKeys[0] === field) {
            dataWithoutCurrentFilter = fullCurrentData.filter(value => !currentData.includes(value));
          } else if (filtersKeys.length >= 2) {
            dataWithoutCurrentFilter = this.filterAndSortData(this.dataSource, {
              ...this.queryParams,
              filters: filtersKeys.reduce((acc, key) => {
                if (key !== field) {
                  acc[key] = this.queryParams.filters[key];
                }
                return acc;
              }, {})
            })
              .map(obj => obj[field])
              .filter(value => !currentData.includes(value));

            dataWithoutCurrentFilter = uniqueSorted(dataWithoutCurrentFilter);
          }
        }

        const labelFormatter =
          field === 'warehouse_id'
            ? val => {
              const warehouse = this.app?.warehouses?.find(w => w.warehouse_id == val);
              return warehouse?.warehouse_short_name || val;
            }
            : null;

        const params = {
          ...e,
          filterWrapper,
          currentData,
          data,
          fullCurrentData,
          dataWithoutCurrentFilter,
          labelFormatter
        };

        this.customFilter.init(params);
        this.customFilter.gridApi = this.gridApi;
        this.customFilter.wpTable = this.wpTable;
        this.customFilter.render(params, this.queryParams);
        this.customFilter.onChangeColumnParams = columnParams => {
          e.column.colDef.filterValues = {
            ...(e.column.colDef.filterValues || {}),
            ...columnParams
          };
        };
      },
      defaultColDef: {
        filter: 'agTextColumnFilter',
        floatingFilter: true, // Добавляет панельку под заголовком
        closeOnApply: true,
        sortable: false
        // filter: 'agSetColumnFilter'
      },
      pagination: false
    };

    const defaultParams = {
      isPagination: false
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);

    super(selector, mergedOptions, mergedParams);

    this.customFilter = new CustomFilter();
    this.customFilter.onChange = queryParams => {
      this.queryParams = queryParams;
      this.tableRender(queryParams);
    };

    this.queryParams = this.queryParams || {};
    this.dataSource = [];

    this.actionCellRenderer = this.actionCellRenderer.bind(this);

    // Переопределяем календарь с defaultDate = предыдущий месяц
    const calendarInput = this.wpTable.querySelector('.input-date-filter');
    if (calendarInput) {
      const now = new Date();
      const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      this.calendar = createCalendar(calendarInput, {
        mode: 'range',
        dateFormat: 'd. M, Y',
        defaultDate: [firstDayPrevMonth, lastDayPrevMonth]
      });
    }
  }

  actionCellRenderer(params) {
    const row = params.eGridCell.closest('.ag-row');
    const button = createElement('button', {
      classes: ['button-table-actions'],
      content: `<span></span><span></span><span></span>`
    });

    const tippyInstance = actions(button, {
      buttonsIs: [true, true],
      attrModal: 'modal-create-operation',
      attributes: [['operation-id', params.data.operation_id]],
      placement: 'bottom-right',
      data: params.data,
      buttons: [
        () => {
          const btn = document.createElement('button')
          btn.classList.add('tippy-button', 'table-tippy-client__button', 'btn-edit-operation')
          btn.innerHTML = `
            <svg class='icon icon-edit'>
              <use xlink:href='#edit'></use>
            </svg>
            <span>Редактировать</span>`

          btn.addEventListener('click', () => {
            const modalCreateOperation = window.app.modalMap['modal-create-operation'];
            if (modalCreateOperation) {
              modalCreateOperation.open({});
              setTimeout(() => {
                modalCreateOperation.openForEdit(params.data);
              }, 100);
            }
            tippyInstance.hide();
          });

          return btn;
        },
        () => {
          const btn = document.createElement('button')
          btn.classList.add('tippy-button', 'table-tippy-client__button', 'btn-delete-operation')
          btn.innerHTML = `
            <svg class='icon icon-trash' style="fill: none;">
              <use xlink:href='#trash'></use>
            </svg>
            <span>Удалить</span>`

          btn.addEventListener('click', () => {
            this.deleteOperation(params.data.operation_id);
            tippyInstance.hide();
          });

          return btn;
        }
      ],
      onEnableEdit: () => { }
    });

    return button;
  }

  async deleteOperation(operationId) {
    if (!confirm('Вы уверены, что хотите удалить эту операцию?')) return;

    try {
      const { api } = await import('../../../settings/api.js');

      const response = await api.post('/_delete_operation_', {
        operation_id: operationId
      });

      if (response.status === 200) {
        window.app.notify.show(response.data);
        await this.refresh();
      }
    } catch (error) {
      console.error('Error deleting operation:', error);
      window.app.notify.show({
        msg: 'Ошибка удаления операции',
        msg_type: 'error'
      });
    }
  }

  tableRender(queryParams = {}) {
    const data = this.filterAndSortData(this.dataSource, queryParams);
    this.cntAll = data.length;
    this.gridApi.setGridOption('rowData', data);
    renderTextHeader({
      tableElement: this.table,
      data: this.calcSummary(data),
      columnMap: {
        4: ({ sum_amount }) => formattingPrice(sum_amount)
      }
    });
  }

  onRendering({ operations = [], cnt_pages, page, cnt_all = 0 }) {
    this.cntAll = cnt_all;
    this.dataSource = operations;
    this.customFilter.data = operations;
    // this.pagination.setPage(page, cnt_pages, cnt_all);
    this.tableRender(this.queryParams);
  }

  filterAndSortData(data = [], params = {}) {
    const { filters = {}, sort_column, sort_direction } = params;
    let result = Array.isArray(data) ? [...data] : [];

    if (filters && Object.keys(filters).length > 0) {
      result = result.filter(item =>
        Object.entries(filters).every(([key, values]) => {
          if (Array.isArray(values) && values.length) {
            return values.includes(String(item[key]));
          }
          return true;
        })
      );
    }

    if (sort_column && sort_direction) {
      result.sort((a, b) => {
        const valA = a?.[sort_column];
        const valB = b?.[sort_column];

        if (valA === valB) return 0;
        if (sort_direction === 'asc') {
          return valA > valB ? 1 : -1;
        }
        if (sort_direction === 'desc') {
          return valA < valB ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }

  calcSummary(operations) {
    return {
      cnt: operations.length,
      sum_amount: operations.reduce((acc, item) => acc + (item.amount || 0), 0)
    };
  }

}

export default TableOperations;
