import Table from '../Table.js';
import { createElement } from '../../../settings/createElement.js'
import { actions } from '../utils/actions.js';

class TableLocks extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Номер замка', field: 'lock_num', minWidth: 120, flex: 1,
          cellRenderer: params => {
            const span = document.createElement('span')
            span.classList.add('table-span-agrid')
            span.textContent = `№${params.value || ''}`
            return span
          }
        },
        {
          headerName: 'ID замка', field: 'lock_id', minWidth: 120, flex: 1,
        },
        {
          headerName: 'Действия', width: 90, resizable: false, sortable: false,
          cellRenderer: params => this.actionCellRenderer(params)
        },
      ],
      pagination: false
    };

    const defaultParams = {
      isPagination: false
    }

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);
    super(selector, mergedOptions, mergedParams);
    this.actionCellRenderer = this.actionCellRenderer.bind(this);
  }

  actionCellRenderer(params) {
    const button = createElement('button', {
      classes: ['button-table-actions'],
      content: `<span></span><span></span><span></span>`
    });

    const tippyInstance = actions(button, {
      buttonsIs: [true, true],
      attrModal: 'modal-create-lock',
      attributes: [['lock-id', params.data.lock_id]],
      placement: 'bottom-right',
      data: params.data,
      buttons: [
        () => {
          const btn = document.createElement('button')
          btn.classList.add('tippy-button', 'table-tippy-client__button', 'btn-edit-lock')
          btn.innerHTML = `
            <svg class='icon icon-edit'>
              <use xlink:href='#edit'></use>
            </svg>
            <span>Редактировать</span>`

          btn.addEventListener('click', () => {
            const modalCreateLock = window.app.modalMap['modal-create-lock'];
            if (modalCreateLock) {
              modalCreateLock.open({});
              setTimeout(() => {
                modalCreateLock.openForEdit(params.data);
              }, 100);
            }
            tippyInstance.hide();
          });

          return btn;
        },
        () => {
          const btn = document.createElement('button')
          btn.classList.add('tippy-button', 'table-tippy-client__button', 'btn-delete-lock')
          btn.innerHTML = `
            <svg class='icon icon-trash' style="fill: none;">
              <use xlink:href='#trash'></use>
            </svg>
            <span>Удалить</span>`

          btn.addEventListener('click', () => {
            this.deleteLock(params.data.lock_id);
            tippyInstance.hide();
          });

          return btn;
        }
      ],
      onEnableEdit: () => { }
    });

    return button;
  }

  async deleteLock(lock_id) {
    if (!confirm('Вы уверены, что хотите удалить замок?')) return;

    try {
      this.loader.enable();
      const response = await api.post('/_delete_lock_', { lock_id });
      if (response.status !== 200) return;
      this.app.notify.show(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      this.loader.enable();
    }
  }

  onRendering({ locks = [], cnt_pages, page, cnt_all = 0 }) {
    this.cntAll = locks.length
    // this.pagination.setPage(page, cnt_pages, cnt_all)
    console.log(locks);

    this.gridApi?.setGridOption('rowData', locks)
  }
}

export default TableLocks