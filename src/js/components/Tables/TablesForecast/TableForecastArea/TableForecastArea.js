import BaseTableForecast from '../BaseTableForecast.js';
import { dateFormatter } from '../../../../settings/dateFormatter.js';

import { formattingPrice } from '../../../../utils/formattingPrice.js';
import { cellRendererInput } from '../../utils/cellRenderer.js';

class TableForecastArea extends BaseTableForecast {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Период', field: 'data', minWidth: 80, flex: 0.5,
          valueFormatter: params => {
            if (!params.value) return '';
            // Определяем формат даты на основе наличия дня
            const hasDay = /^\d{4}-\d{2}-\d{2}$/.test(params.value);
            const format = hasDay ? "dd.MM.yyyy" : "yyyy, MMMM";

            return dateFormatter(params.value, format);
          }
        },
        {
          headerName: 'Выручка план', field: 'revenue_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => cellRendererInput(params, { funcFormate: formattingPrice, inputmode: 'numeric', })
        },
        {
          headerName: 'Выручка факт', field: 'revenue', minWidth: 80, flex: 0.5,
          valueFormatter: params => formattingPrice(params.value)
        },
        {
          headerName: '% выполнения', field: '', minWidth: 80, flex: 0.4,
          valueFormatter: params => {
            const { revenue, revenue_planned } = params.data
            return +revenue_planned ? (+revenue / +revenue_planned * 100).toFixed(2) + '%' : '—'
          }
        },
        {
          headerName: 'Выезды (м²) (план)', field: 'outflow_area', minWidth: 80, flex: 0.5,
          cellRenderer: params => cellRendererInput(params, { inputmode: 'decimal' })
        },
        {
          headerName: 'Выезды (м²) (факт)	% выполнения', field: 'outflow_area_planned', minWidth: 80, flex: 0.5,
        },
        {
          headerName: 'Заезды (м²) (план)', field: 'inflow_area_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => cellRendererInput(params, { inputmode: 'decimal' })
        },
        {
          headerName: 'Заезды (м²) (факт)', field: 'inflow_area', minWidth: 80, flex: 0.5,
        },
        {
          headerName: 'Выручка накопленным итогом (план)', field: 'revenue_accumulated_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => cellRendererInput(params, { funcFormate: formattingPrice, inputmode: 'numeric' })
        },
        {
          headerName: 'Выручка накопленным итогом (факт)', field: 'revenue_accumulated', minWidth: 80, flex: 0.5,
          valueFormatter: params => formattingPrice(params.value)
        },
        {
          headerName: 'Арендованная площадь (план)', field: 'rented_area_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => cellRendererInput(params, { funcFormate: formattingPrice, inputmode: 'decimal' })
        },
        {
          headerName: 'Арендованная площадь (факт)', field: 'rented_area', minWidth: 80, flex: 0.5,
        },
        {
          headerName: '% выполнения', field: '', minWidth: 80, flex: 0.6, resizable: false,
          valueFormatter: params => {
            const { rented_area, rented_area_planned } = params.data
            return +rented_area_planned ? (+rented_area / +rented_area_planned * 100).toFixed(2) + '%' : '—'
          }
        },
        {
          headerName: '', field: '', width: 50, resizable: false,
          cellRenderer: params => this.btnEditCellRenderer(params)
        }
      ],
      // pagination: false,
    };

    const defaultParams = {
      isPagination: false,
      endpoint: '/_set_finance_plan_',
      keysQueryParams: ['revenue', 'revenue_accumulated', 'outflow_area', 'inflow_area', 'rented_area']
    }

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);
    super(selector, mergedOptions, mergedParams);
  }

  onRendering({ finance_planfact = [] }) {
    this.data = finance_planfact
    this.gridApi.setGridOption('rowData', finance_planfact)
    this.gridApi.setGridOption('paginationPageSize', finance_planfact.length + 20)
  }
}

export default TableForecastArea