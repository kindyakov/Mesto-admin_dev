import Table from '../Table.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { actions } from '../utils/actions.js';
import { createElement } from '../../../settings/createElement.js';

class TableOperations extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      getRowId: (params) => params.data.operation_id,
      columnDefs: [
        {
          headerName: 'Дата',
          field: 'operation_date',
          minWidth: 90,
          flex: 0.3,
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
          flex: 0.5,
        },
        {
          headerName: 'Подкатегория',
          field: 'subcategory',
          minWidth: 100,
          flex: 0.3,
        },
        {
          headerName: 'Сумма платежа (₽)',
          field: 'amount',
          minWidth: 100,
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
          cellRenderer: params => this.actionCellRenderer(params),
        }
      ]
    };

    const defaultParams = {
      selectTypeUser: true,
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);

    super(selector, mergedOptions, mergedParams);

    this.actionCellRenderer = this.actionCellRenderer.bind(this);
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
      const { outputInfo } = await import('../../../utils/outputinfo.js');

      const response = await api.post('/_delete_operation_', {
        operation_id: operationId
      });

      if (response.status === 200) {
        window.app.notify.show(response.data);

        // Находим и удаляем строку из таблицы
        const rowNode = this.gridApi.getRowNode(operationId);
        if (rowNode) {
          this.gridApi.applyTransaction({ remove: [rowNode.data] });
        } else {
          // Если не нашли по ID, ищем по operation_id
          const rowData = [];
          this.gridApi.forEachNode(node => {
            if (node.data.operation_id === operationId) {
              rowData.push(node.data);
            }
          });
          if (rowData.length > 0) {
            this.gridApi.applyTransaction({ remove: rowData });
          }
        }

        // Обновляем счетчик общего количества
        if (this.cntAll) {
          this.cntAll -= 1;
        }
      }
    } catch (error) {
      console.error('Error deleting operation:', error);
      window.app.notify.show({
        msg: 'Ошибка удаления операции',
        msg_type: 'error'
      });
    }
  }

  onRendering({ operations = [], cnt_pages, page, cnt_all = 0 }) {
    this.cntAll = cnt_all;
    this.pagination.setPage(page, cnt_pages, cnt_all);
    this.gridApi.setGridOption('rowData', operations);
  }

  addOperation(operationData) {
    console.log('TableOperations.addOperation called with:', operationData);

    // Добавляем новую строку в начало таблицы
    const result = this.gridApi.applyTransaction({ add: [operationData], addIndex: 0 });
    console.log('applyTransaction result:', result);

    // Обновляем счетчик
    if (this.cntAll !== undefined) {
      this.cntAll += 1;
    }
  }

  updateOperation(operationData) {
    console.log('TableOperations.updateOperation called with:', operationData);

    // Обновляем существующую строку
    // Благодаря getRowId, AG Grid автоматически найдет строку по operation_id
    const result = this.gridApi.applyTransaction({ update: [operationData] });
    console.log('applyTransaction result:', result);

    if (!result || !result.update || result.update.length === 0) {
      console.log('Row not found or not updated for operation_id:', operationData.operation_id);
    }
  }
}

export default TableOperations;
