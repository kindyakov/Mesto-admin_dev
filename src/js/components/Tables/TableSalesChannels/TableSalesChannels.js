import Table from '../Table.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';

class TableSalesChannels extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Канал продаж', field: 'sale_channel_name', minWidth: 120, flex: 0.6,
        },
        {
          headerName: 'Бюджет', field: 'revenue', minWidth: 80, flex: 0.4,
          valueFormatter: params => params.value ? formattingPrice(params.value) : ''
        },
        {
          headerName: 'Все лиды', field: 'leads', minWidth: 80, flex: 0.4,
        },
        {
          headerName: 'Цена лида', field: '', minWidth: 100, flex: 0.5,
          valueFormatter: params => params.value ? formattingPrice(params.value) : ''
        },
        {
          headerName: 'Количество сделок', field: 'lead_cost', minWidth: 70, flex: 0.4,
        },
        {
          headerName: '% конверсии', field: 'conversion_rate', minWidth: 80, flex: 0.5,
          valueFormatter: params => params.value ? params.value + '%' : ''
        },
        {
          headerName: 'Выручка', field: 'sales', minWidth: 100, flex: 0.5,
          valueFormatter: params => params.value ? formattingPrice(params.value) : ''
        },
        {
          headerName: 'ROI', field: 'roi', minWidth: 80, flex: 0.4, resizable: false,
          valueFormatter: params => params.value ? params.value + '%' : ''
        },
      ],
      pagination: false,
      domLayout: 'autoHeight',
    };

    const defaultParams = {
      isPagination: false,
    }

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);

    super(selector, mergedOptions, mergedParams);
  }

  onRendering({ sale_channels_stats, cnt_pages, page, cnt_all = 0 }) {
    this.cntAll = cnt_all
    // this.setPage(page, cnt_pages)
    this.gridApi.setGridOption('rowData', sale_channels_stats)
    // this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, sale_channels_stats.length])
  }
}

export default TableSalesChannels