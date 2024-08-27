import Table from '../Table.js';
import datePicker from '../../../configs/datepicker.js';
import CustomHeaderComponentAddSales from './Components/CustomHeaderComponentAddSales.js';
import CustomHeaderComponentEdit from './Components/CustomHeaderComponentEdit.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { createElement } from '../../../settings/createElement.js';
import { api } from '../../../settings/api.js';

class TableSalesChannelsEdit extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Канал продаж', field: 'sale_channel_name', minWidth: 120, flex: 0.6, resizable: false,
        },
        {
          headerName: 'Сумма затрат', field: 'expenses', minWidth: 80, flex: 0.4, resizable: false,
          cellRenderer: params => cellRendererInput(params, { inputmode: 'numeric' })
        },
        {
          headerName: '', field: '', minWidth: 40, width: 40, resizable: false, sortable: false,
          headerComponentParams: {
            template: `<svg class='icon icon-edit' style="flex-shrink: 0; stroke: #000; width: 15px; height: 15px;">
                        <use xlink:href='img/svg/sprite.svg#edit'></use>
                      </svg>
                      <svg class="icon icon-check"><use xlink:href="img/svg/sprite.svg#check"></use></svg>`
          },
          headerComponent: CustomHeaderComponentEdit
        },
        {
          headerName: '', field: 'channel_id', minWidth: 40, width: 40, resizable: false, sortable: false,
          headerComponentParams: {
            template: `<svg class='icon icon-plus' style="flex-shrink: 0; width: 10px; height: 10px;">
                        <use xlink:href='img/svg/sprite.svg#plus'></use>
                      </svg>`,
          },
          headerComponent: CustomHeaderComponentAddSales,
          cellRenderer: ({ api, value, data }) => {
            const button = createElement('button', { classes: ['btn-del'] })

            button.addEventListener('click', () => {
              const formData = new FormData()
              formData.set('sale_channel_id', value)

              this.deleteSaleChannel(formData).then(({ msg_type = '' }) => {
                if (msg_type === 'success') {
                  api.applyTransaction({ remove: [data] })
                }
              })
            })

            return button
          }
        },
      ],
      pagination: false,
    };

    const defaultParams = {
      isPagination: false,
    }

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);

    super(selector, mergedOptions, mergedParams);

    const datepicker = datePicker(this.wpTable.querySelector('.input-date-filter-month'), {
      view: 'months',
      minView: 'months',
      dateFormat: 'yyyy-MM',
      position: 'bottom right',
      onSelect: ({ date, formattedDate, datepicker }) => {
        this.changeQueryParams({ [datepicker.$el.name]: formattedDate })
      }
    });
  }

  onRendering({ sale_channels = [], cnt_all = 0 }) {
    this.cntAll = cnt_all
    // this.setPage(page, cnt_pages)
    this.gridApi.setGridOption('rowData', sale_channels)
    this.gridApi.setGridOption('paginationPageSize', sale_channels.length + 20)
  }

  async deleteSaleChannel(formData) {
    try {
      this.loader.enable()
      const response = await api.post('/_delete_sale_channel_', formData)
      if (response.status !== 200) return null
      this.app.notify.show(response.data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      this.loader.disable()
    }
  }
}

export default TableSalesChannelsEdit