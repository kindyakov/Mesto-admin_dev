import Table from '../Table.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';

class TableSalesChannels extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Канал продаж', field: '', minWidth: 120, flex: 0.6,
        },
        {
          headerName: 'Бюджет', field: '', minWidth: 80, flex: 0.4,
          valueFormatter: params => params.value ? formattingPrice(params.value) : ''
        },
        {
          headerName: 'Все лиды', field: '', minWidth: 80, flex: 0.4,
        },
        {
          headerName: 'Цена лида', field: '', minWidth: 100, flex: 0.5,
          valueFormatter: params => params.value ? formattingPrice(params.value) : ''
        },
        {
          headerName: 'Количество сделок', field: '', minWidth: 70, flex: 0.4,
        },
        {
          headerName: '% конверсии', field: '', minWidth: 80, flex: 0.5,
          valueFormatter: params => params.value ? params.value + '%' : ''
        },
        {
          headerName: 'Выручка', field: '', minWidth: 100, flex: 0.5,
          valueFormatter: params => params.value ? formattingPrice(params.value) : ''
        },
        {
          headerName: 'ROI', field: '', minWidth: 80, flex: 0.4, resizable: false,
          valueFormatter: params => params.value ? params.value + '%' : ''
        },
      ],
    };

    const defaultParams = {}
    
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

export default TableSalesChannels