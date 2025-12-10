import Table from '../Table.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { getFormattedDate } from '../../../utils/getFormattedDate.js';


class TableBudget extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Дата',
          field: 'date',
          minWidth: 90,
          flex: 0.3,
          valueFormatter: params => params.value ? dateFormatter(params.value) : 'нет'
        },
        {
          headerName: 'Склад',
          field: 'fullname',
          minWidth: 300,
          flex: 1,
          valueFormatter: params => params.value ? formattingPrice(params.value) : 'нет'
        },
        {
          headerName: 'Выручка от аренды',
          field: 'username',
          minWidth: 160,
          flex: 0.5,
          valueFormatter: params => params.value ? formattingPrice(params.value) : 'нет'
        },
        {
          headerName: 'Расходы',
          field: 'email',
          minWidth: 200,
          flex: 0.5,
          valueFormatter: params => params.value ? formattingPrice(params.value) : 'нет'
        },
        {
          headerName: 'Прибыль',
          field: 'agrbegdate',
          minWidth: 130,
          flex: 0.6,
          valueFormatter: params => params.value ? formattingPrice(params.value) : 'нет'
        },
        {
          headerName: 'Маркетинг',
          field: 'price',
          minWidth: 100,
          flex: 0.5,
          valueFormatter: params => params.value ? formattingPrice(params.value) : 'нет'
        },
        {
          headerName: 'Операционные',
          field: 'room_names',
          minWidth: 90,
          flex: 0.5,
          valueFormatter: params => params.value ? formattingPrice(params.value) : 'нет'
        },
        {
          headerName: 'Аренда помещения',
          field: 'agrplanenddate',
          minWidth: 100,
          flex: 0.5,
          valueFormatter: params => (params.value ? getFormattedDate(params.value) : 'нет')
        },
        {
          headerName: 'Разовые РК',
          field: 'last_payment_type',
          minWidth: 100,
          flex: 0.5,
          valueFormatter: params => params.value ? formattingPrice(params.value) : 'нет'

        },
        {
          headerName: 'Оплата труда продавца',
          field: 'days_left',
          minWidth: 90,
          flex: 0.5,
          valueFormatter: params => params.value ? formattingPrice(params.value) : 'нет'
        },
        {
          headerName: 'Оплата труда персонала',
          field: 'actions',
          minWidth: 100,
          flex: 0.5,
          valueFormatter: params => params.value ? formattingPrice(params.value) : 'нет'
        },
        {
          headerName: 'Прочие расходы',
          field: 'actions',
          minWidth: 100,
          flex: 0.5,
          valueFormatter: params => params.value ? formattingPrice(params.value) : 'нет'
        },
        {
          headerName: 'Налоги',
          field: 'actions',
          minWidth: 100,
          flex: 0.3,
          valueFormatter: params => params.value ? formattingPrice(params.value) : 'нет'
        }
      ],
      pagination: false

    };

    const defaultParams = {
      isPagination: false
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);
    super(selector, mergedOptions, mergedParams);

  }

  onRendering(data) {
    console.log(data)
    // this.cntAll = cnt_all;
    // this.gridApi.setGridOption('rowData', agreements);
  }
}

export default TableBudget;
