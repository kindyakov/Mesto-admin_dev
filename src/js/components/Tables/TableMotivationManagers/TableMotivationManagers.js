import Table from '../Table.js';
import tippy from '../../../configs/tippy.js';

import { api } from '../../../settings/api.js';

import { actions } from '../utils/actions.js';
import { addPrefixToNumbers } from '../utils/addPrefixToNumbers.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { observeCell } from '../utils/observeCell.js';
import { createElement } from '../../../settings/createElement.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';

class TableMotivationManagers extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Месяц',
          field: 'month',
          minWidth: 120,
          flex: 1,
          valueFormatter: params => dateFormatter(params.value, 'MMMM yyyy')
        },
        {
          headerName: 'Оклад',
          field: 'oklad',
          minWidth: 100,
          flex: 1,
          valueFormatter: params => formattingPrice(params.value)
        },
        {
          headerName: 'Градация новых продаж',
          field: 'gradation_start',
          minWidth: 200,
          flex: 1.5,
          valueFormatter: params => `${formattingPrice(params.data.gradation_start)} - ${formattingPrice(params.data.gradation_end)}`
        },
        {
          headerName: '% бонуса',
          field: 'bonus_percent',
          minWidth: 100,
          flex: 1,
          valueFormatter: params => params.value + '%'
        },
        {
          headerName: 'Действия',
          field: 'actions',
          width: 90,
          resizable: false,
          sortable: false
        }
      ]
    };

    const defaultParams = {
      isPagination: false,
      onChangeTypeUser: () => { }
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);
    super(selector, mergedOptions, mergedParams);
  }

  onRendering({ motivation_info = [], }) {
    this.gridApi.setGridOption('rowData', motivation_info);
  }

  async editMotivationManager(data) {
    try {
      this.loader.enable();
      const response = await api.post('/_set_motivation_info_', data);
      if (response.status !== 200) return;
      this.app.notify.show(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      this.loader.disable();
    }
  }
}

export default TableMotivationManagers;
