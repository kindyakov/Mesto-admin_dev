import Table from '../Table.js';
import CustomHeaderComponentAddSales from './Components/CustomHeaderComponentAddSales.js';
import CustomHeaderComponentEdit from './Components/CustomHeaderComponentEdit.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';

class TableSalesChannelsEdit extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Канал продаж', field: 'sale_channel', minWidth: 120, flex: 0.6, resizable: false,
        },
        {
          headerName: 'Сумма затрат', field: 'expenses', minWidth: 80, flex: 0.4, resizable: false,
          cellRenderer: params => cellRendererInput(params, { funcFormate: formattingPrice, inputmode: 'numeric' })
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
          headerName: '', field: '', minWidth: 40, width: 40, resizable: false, sortable: false,
          headerComponentParams: {
            template: `<svg class='icon icon-plus' style="flex-shrink: 0; width: 10px; height: 10px;">
                        <use xlink:href='img/svg/sprite.svg#plus'></use>
                      </svg>`,
          },
          headerComponent: CustomHeaderComponentAddSales,
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
  }

  onRendering({ sale_channels = [] }) {
    // this.setPage(page, cnt_pages)
    this.gridApi.setGridOption('rowData', sale_channels)
    this.gridApi.setGridOption('paginationPageSize', sale_channels.length + 20)
  }
}

export default TableSalesChannelsEdit