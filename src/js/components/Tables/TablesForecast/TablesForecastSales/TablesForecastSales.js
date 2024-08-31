import BaseTableForecast from '../BaseTableForecast.js';
import { dateFormatter } from '../../../../settings/dateFormatter.js';
import { cellRendererInput } from '../../utils/cellRenderer.js';

import { cellDatePicker } from '../utils/cellDatePicker.js';
import { cellColorize } from '../utils/cellColorize.js';
import { getFormattedNumber } from '../utils/getFormattedNumber.js';

class TablesForecastSales extends BaseTableForecast {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Период', field: 'data', minWidth: 120, flex: 0.6,
          cellRenderer: params => {
            if (!params.value) return '';
            // Определяем формат даты на основе наличия дня
            const hasDay = /^\d{4}-\d{2}-\d{2}$/.test(params.value);
            const format = hasDay ? "dd.MM.yyyy" : "yyyy, MMMM";
            const el = cellRendererInput(params, { funcFormate: value => dateFormatter(value, format) })

            cellDatePicker(el.querySelector('input'), { params, prefixClass: 'table-forecast-sales', hasDay })
            this.addHandleDbClickCell(params)

            return el
          }
        },
        {
          headerName: 'Количество лидов (план)', field: 'leads_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => {
            this.addHandleDbClickCell(params)
            return cellRendererInput(params, { inputmode: 'numeric' })
          }
        },
        {
          headerName: 'Количество лидов (факт)', field: 'leads_fact', minWidth: 80, flex: 0.6,
          cellRenderer: params => {
            this.addHandleDbClickCell(params)
            return cellRendererInput(params, { inputmode: 'numeric' })
          }
        },
        {
          headerName: '% выполнения', field: '', minWidth: 80, flex: 0.4,
          cellRenderer: params => {
            const { leads_fact, leads_planned } = params.data
            const value = getFormattedNumber(+leads_planned ? (+leads_fact / +leads_planned * 100) : 0)
            cellColorize(value, params)            
            return value + '%'
          }
        },
        {
          headerName: 'Количество лидов нарастающим итогом (план)', field: 'leads_accumulated_planned', minWidth: 80, flex: 0.5,
        },
        {
          headerName: 'Количество лидов нарастающим итогом (факт)', field: 'leads_accumulated_fact', minWidth: 80, flex: 0.5,
          // valueFormatter: params => params.value ? getFormattedDate(params.value) : 'нет'
        },
        {
          headerName: '% выполнения', field: '', minWidth: 80, flex: 0.5,
          cellRenderer: params => {
            const { leads_accumulated_fact = 0, leads_accumulated_planned = 0 } = params.data
            const value = getFormattedNumber(+leads_accumulated_planned ? (+leads_accumulated_fact / +leads_accumulated_planned * 100) : 0)
            cellColorize(value, params)
            return value + '%'
          }
        },
        {
          headerName: 'Сделок (план)', field: 'sales_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => {
            this.addHandleDbClickCell(params)
            return cellRendererInput(params, { inputmode: 'numeric' })
          }
        },
        {
          headerName: 'Сделок (факт)', field: 'sales', minWidth: 80, flex: 0.5,
        },
        {
          headerName: '% выполнения', field: '', minWidth: 80, flex: 0.4, resizable: false,
          cellRenderer: params => {
            const { sales, sales_planned } = params.data
            const value = getFormattedNumber(+sales_planned ? (+sales / +sales_planned * 100) : 0)
            cellColorize(value, params)
            return value + '%'
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