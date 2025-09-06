import Table from '../Table.js';
import { addPrefixToNumbers } from '../utils/addPrefixToNumbers.js';
import { createElement } from '../../../settings/createElement.js';
import { getFormattedDate } from '../../../utils/getFormattedDate.js';

class TablePlan extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Дата',
          field: 'data',
          minWidth: 120,
          flex: 0.1,
          valueFormatter: params => getFormattedDate(params.value)
        },
        {
          headerName: 'Выручка план нарастающим итогом',
          field: '',
          minWidth: 60,
        },
        {
          headerName: 'Выручка факт нарастающим итогом',
          field: '',
          minWidth: 60,
        },
        {
          headerName: 'Выручка в день',
          field: '',
          minWidth: 60,
        },
        {
          headerName: '% выполнения',
          field: '',
          minWidth: 60,
        },
        {
          headerName: 'Заполнение план нарастающим итогом',
          field: '',
          minWidth: 60,
        },
        {
          headerName: 'Заполнение факт общий нарастающим',
          field: '',
          minWidth: 60,
        },
        {
          headerName: 'Заполнение в день, м2',
          field: '',
          minWidth: 60,
        },
        {
          headerName: '% выполнения',
          field: '',
          minWidth: 60,
        },
        {
          headerName: 'Лиды план нарастающим итогом',
          field: '',
          minWidth: 60,
        },
        {
          headerName: 'Лидов факт общий нарастающим',
          field: '',
          minWidth: 60,
        },
        {
          headerName: 'Лиды в день',
          field: '',
          minWidth: 60,
        },
        {
          headerName: '% выполнения ОБЩИЙ',
          field: '',
          minWidth: 60,
        },
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

  onRendering({ finance_planfact }) {
    this.gridApi.setGridOption('rowData', finance_planfact);
  }
}

export default TablePlan;