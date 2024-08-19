import BaseTableForecast from '../BaseTableForecast.js';
import { dateFormatter } from '../../../../settings/dateFormatter.js';

import { cellRendererInput } from '../../utils/cellRenderer.js';

class TablesForecastSales extends BaseTableForecast {
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
          headerName: 'Количество лидов (план)', field: 'leads_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => cellRendererInput(params, { inputmode: 'numeric' })
        },
        {
          headerName: 'Количество лидов (факт)', field: 'leads_fact', minWidth: 80, flex: 0.6,
        },
        {
          headerName: '% выполнения', field: '', minWidth: 80, flex: 0.4,
          valueFormatter: params => {
            const { leads_fact, leads_planned } = params.data
            return +leads_planned ? (+leads_fact / +leads_planned * 100).toFixed(2) + '%' : '—'
          }
        },
        {
          headerName: 'Количество лидов нарастающим итогом (план)', field: 'leads_accumulated_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => cellRendererInput(params, { inputmode: 'numeric' })
        },
        {
          headerName: 'Количество лидов нарастающим итогом (факт)', field: 'leads_accumulated_fact', minWidth: 80, flex: 0.5,
          // valueFormatter: params => params.value ? getFormattedDate(params.value) : 'нет'
        },
        {
          headerName: '% выполнения', field: '', minWidth: 80, flex: 0.5,
          valueFormatter: params => {
            const { leads_accumulated_fact, leads_accumulated_planned } = params.data
            return +leads_accumulated_planned ? (+leads_accumulated_fact / +leads_accumulated_planned * 100).toFixed(2) + '%' : '—'
          }
        },
        {
          headerName: 'Сделок (план)', field: 'sales_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => cellRendererInput(params, { inputmode: 'numeric' })
        },
        {
          headerName: 'Сделок (факт)', field: 'sales', minWidth: 80, flex: 0.5,
        },
        {
          headerName: '% выполнения', field: '', minWidth: 80, flex: 0.4, resizable: false,
          valueFormatter: params => {
            const { sales, sales_planned } = params.data
            return +sales_planned ? (+sales / +sales_planned * 100).toFixed(2) + '%' : '—'
          }
        },
        {
          headerName: '', field: '', width: 50, resizable: false,
          cellRenderer: params => this.btnEditCellRenderer(params)
        }
      ],
    };

    const defaultParams = {
      isPagination: false,
      endpoint: '/_set_sales_plan_',
      keysQueryParams: ['leads_accumulated_fact', 'leads_accumulated_planned', 'leads_fact', 'leads_planned', 'sales_planned']
    }

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);
    super(selector, mergedOptions, mergedParams);
  }

  onRendering({ sales_planfact = [] }) {
    this.data = sales_planfact
    this.gridApi.setGridOption('rowData', sales_planfact)
    this.gridApi.setGridOption('paginationPageSize', sales_planfact.length + 20)
  }
}

export default TablesForecastSales