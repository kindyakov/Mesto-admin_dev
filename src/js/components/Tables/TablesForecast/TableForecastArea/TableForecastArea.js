import BaseTableForecast from '../BaseTableForecast.js';
import datePicker from '../../../../configs/datepicker.js';
import { dateFormatter } from '../../../../settings/dateFormatter.js';
import { formattingPrice } from '../../../../utils/formattingPrice.js';
import { cellRendererInput } from '../../utils/cellRenderer.js';

import { cellDatePicker } from '../utils/cellDatePicker.js';
import { cellColorize } from '../utils/cellColorize.js';
import { getFormattedNumber } from '../utils/getFormattedNumber.js';

class TableForecastArea extends BaseTableForecast {
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

            cellDatePicker(el.querySelector('input'), { params, prefixClass: 'table-forecast-area', hasDay })
            this.addHandleDbClickCell(params)

            return el
          }
        },
        {
          headerName: 'Выручка план', field: 'revenue_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => {
            this.addHandleDbClickCell(params)
            return cellRendererInput(params, { funcFormate: formattingPrice, inputmode: 'numeric', })
          }
        },
        {
          headerName: 'Выручка факт', field: 'revenue', minWidth: 80, flex: 0.5,
          valueFormatter: params => formattingPrice(params.value)
        },
        {
          headerName: '% выполнения', field: '', minWidth: 80, flex: 0.4,
          cellRenderer: params => {
            const { revenue, revenue_planned } = params.data
            const value = getFormattedNumber(+revenue_planned ? (+revenue / +revenue_planned * 100) : 0)
            cellColorize(value, params)
            return value + '%'
          }
        },
        {
          headerName: 'Выезды (м²) (план)', field: 'outflow_area', minWidth: 80, flex: 0.5,
          cellRenderer: params => {
            this.addHandleDbClickCell(params)
            return cellRendererInput(params, { inputmode: 'decimal', funcFormate: val => val.toFixed(1) })
          }
        },
        {
          headerName: 'Выезды (м²) (факт)	% выполнения', field: 'outflow_area_planned', minWidth: 80, flex: 0.5,
        },
        {
          headerName: 'Заезды (м²) (план)', field: 'inflow_area_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => {
            this.addHandleDbClickCell(params)
            return cellRendererInput(params, { inputmode: 'decimal' })
          }
        },
        {
          headerName: 'Заезды (м²) (факт)', field: 'inflow_area', minWidth: 80, flex: 0.5,
          valueFormatter: ({ value }) => value ? value.toFixed(1) : ''
        },
        {
          headerName: 'Выручка накопленным итогом (план)', field: 'revenue_accumulated_planned', minWidth: 80, flex: 0.5,
          valueFormatter: params => formattingPrice(params.value)
        },
        {
          headerName: 'Выручка накопленным итогом (факт)', field: 'revenue_accumulated', minWidth: 80, flex: 0.5,
          valueFormatter: params => formattingPrice(params.value)
        },
        {
          headerName: 'Арендованная площадь (план)', field: 'rented_area_planned', minWidth: 80, flex: 0.5,
          cellRenderer: params => {
            this.addHandleDbClickCell(params)
            return cellRendererInput(params, { inputmode: 'decimal' })
          }
        },
        {
          headerName: 'Арендованная площадь (факт)', field: 'rented_area', minWidth: 80, flex: 0.5,
          valueFormatter: ({ value }) => value ? value.toFixed(1) : ''
        },
        {
          headerName: '% выполнения', field: '', minWidth: 80, flex: 0.6, resizable: false,
          cellRenderer: params => {
            const { rented_area, rented_area_planned } = params.data
            const value = getFormattedNumber(+rented_area_planned ? (+rented_area / +rented_area_planned * 100) : 0)
            cellColorize(value, params)
            return value + '%'
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
      keysQueryParams: ['revenue_planned', 'revenue_accumulated', 'outflow_area', 'inflow_area', 'rented_area']
    }

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);
    super(selector, mergedOptions, mergedParams);
  }

  onRendering({ finance_planfact = [], cnt_all }) {
    this.cntAll = cnt_all
    this.data = finance_planfact
    this.gridApi.setGridOption('rowData', finance_planfact)
    this.gridApi.setGridOption('paginationPageSize', finance_planfact.length + 20)
  }
}

export default TableForecastArea