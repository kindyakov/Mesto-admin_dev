import Table from '../Table.js';
import CustomHeaderComponentAddSales from './Components/CustomHeaderComponentAddSales.js';
import CustomHeaderComponentEdit from './Components/CustomHeaderComponentEdit.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';

class TableSalesChannelsEdit extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Канал продаж', field: '', minWidth: 120, flex: 0.6, resizable: false,
        },
        {
          headerName: 'Сумма затрат', field: '', minWidth: 80, flex: 0.4, resizable: false,
          valueFormatter: params => params.value ? formattingPrice(params.value) : ''
        },
        {
          headerName: '', field: '', minWidth: 40, width: 40, resizable: false, sortable: false,
          headerComponentParams: {
            template: `<svg class='icon icon-edit' style="flex-shrink: 0; stroke: #000; width: 15px; height: 15px;">
                        <use xlink:href='img/svg/sprite.svg#edit'></use>
                      </svg>`
          },
          headerComponent: CustomHeaderComponentEdit
        },
        {
          headerName: '', field: '', minWidth: 40, width: 40, resizable: false, sortable: false,
          headerComponentParams: {
            template: `<svg class='icon icon-plus' style="flex-shrink: 0; width: 10px; height: 10px;">
                        <use xlink:href='img/svg/sprite.svg#plus'></use>
                      </svg>`
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

  render(data) {
    return
    const { rooms, cnt_pages, page } = data;
    this.setPage(page, cnt_pages)
    this.gridApi.setGridOption('rowData', rooms)
    this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, rooms.length])
  }
}

export default TableSalesChannelsEdit