import uniqBy from 'lodash.uniqby'
import merge from "lodash.merge";

import Table from "../Table.js";
import CustomFilter from "./CustomFilter/CustomFilter.js";

import { addPrefixToNumbers } from '../utils/addPrefixToNumbers.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { observeCell } from "../utils/observeCell.js";
import { createDaysLeftElement } from '../utils/createDaysLeftElement.js';

import { formattingPrice } from '../../../utils/formattingPrice.js';
import { getFormattedDate } from "../../../utils/getFormattedDate.js";

import { downloadFuturePayments } from "../../../settings/request.js";
import { createElement } from "../../../settings/createElement.js";

import tippy from '../../../configs/tippy.js'

class TableUpcomingPayments extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        { headerCheckboxSelection: true, checkboxSelection: true, width: 50, resizable: false, sortable: false, filter: false },
        {
          headerName: 'Дата платежа', field: 'write_off_date', minWidth: 140, flex: 0.2,
          // filter: 'agDateColumnFilter',
          cellRenderer: params => cellRendererInput(params, { funcFormate: getFormattedDate, iconId: 'calendar' }),
        },
        {
          headerName: 'Сумма', field: 'price', minWidth: 180, flex: 0.5,
          filter: 'agNumberColumnFilter',
          cellRenderer: params => {
            const span = createElement('span', {
              classes: ['table-span-price'],
              content: params.value ? formattingPrice(params.value) : 'нет',
            })

            if (!params.data.real_payment) {
              span.classList.add(new Date(params.data.write_off_date) >= new Date() ? 'warning' : 'error')
            }

            return cellRendererInput(params, { el: span })
          },
          filterRenderer: params => {
            const targetChild = params.filterWrapper.children[1]

            if (params.filterWrapper.querySelector('.dropdown-target')) return

            const dropdownTarget = createElement('div', {
              classes: ['dropdown-target'],
              content: `<input type="text" name="real_payment" value="-1" style="display:none;"><p>Фильтр по цвету</p><svg class="icon icon-arrow"><use xlink:href="img/svg/sprite.svg#arrow"></use></svg>`
            })
            const input = dropdownTarget.querySelector('input')
            const select = this.selects

            const instanceTippy = tippy(dropdownTarget, {
              maxWidth: 150,
              placement: 'right-start',
              offset: [0, 12],
              // appendTo: params.filterWrapper.closest('.ag-popup'),
              trigger: 'mouseenter',
              onCreate(instance) {
                const content = instance.popper.querySelector('.tippy-content')
                content.style.cssText = `display:flex;flex-direction:column;gap:5px;padding:15px;border: 1px solid #dddcdc;border-radius: 4px;`
                const dataBtn = [
                  { bg: '#CFF1E6', color: '#0b704e', real_payment: 1 },
                  { bg: '#FCF1D6', color: '#efbb34', real_payment: 0 },
                  { bg: '#FFDBDB', color: '#d42424', real_payment: 2 },
                  { bg: '#fff', color: '#3C50E0', real_payment: -1 },
                ]

                dataBtn.forEach(obj => {
                  const btn = createElement('button', {
                    classes: ['btn-rect'],
                    attributes: [['style', `color: ${obj.color};background: ${obj.bg};`]],
                    content: obj.content ? obj.content : ''
                  })
                  btn.addEventListener('click', e => handleCLick(e, obj))
                  content.appendChild(btn)
                  obj.btn = btn
                })

                function handleCLick(e, { real_payment, bg, color }) {
                  e.stopPropagation()
                  const btnActive = content.querySelector('._active')

                  if (btnActive && btnActive == e.target) {
                    btnActive.classList.remove('_active')
                    dropdownTarget.removeAttribute('style')
                    input.value = ''
                    return
                  }

                  btnActive?.classList.remove('_active')
                  e.target.classList.add('_active')

                  dropdownTarget.style.cssText = `background:${bg};border-color:${color};`
                  input.value = real_payment
                  select.setValue(real_payment)
                }

                instance.popper.addEventListener('mousedown', e => e.stopPropagation());
              },
            })

            targetChild.insertAdjacentElement('afterend', dropdownTarget);

            params.column.colDef.clearCustomFilter = () => {
              dropdownTarget.removeAttribute('style')
            }
          }
          // headerComponent: CustomHeaderComponent,
          // headerComponentParams: {
          //   headersDataKey: 'sum_amount',
          //   valueFormatter: value => formattingPrice(value)
          // },
        },
        {
          headerName: 'ФИО', field: 'fullname', minWidth: 300, flex: 1,
          cellRenderer: params => {
            const wp = cellRendererInput(params, { iconId: 'profile' })
            observeCell(wp, params)
            return wp
          },
        },
        {
          headerName: 'Договор', field: 'agrid', minWidth: 90, flex: 0.5,
          filter: 'agNumberColumnFilter',
          cellRenderer: params => {
            const span = createElement('span', {
              classes: ['table-span-agrid'],
              content: params.value ? addPrefixToNumbers(params.value) : 'нет',
            })
            return cellRendererInput(params, { el: span })
          }
        },
        {
          headerName: 'Площадь', field: 'area', minWidth: 180, flex: 0.3,
          filter: 'agNumberColumnFilter',
          valueFormatter: params => `${params.value} м²`,
        },
        {
          headerName: 'Средняя ставка', field: 'price_1m', minWidth: 200, flex: 0.5,
          filter: 'agNumberColumnFilter',
          cellRenderer: params => {
            const span = createElement('span', {
              classes: ['table-span-price'],
              content: params.value ? formattingPrice(params.value) : 'нет',
            })
            return cellRendererInput(params, { el: span })
          },
        },
        {
          headerName: 'Физ./Юр.', field: 'user_type', minWidth: 90, flex: 0.5,
          valueFormatter: params => params.value === 'f' ? 'Физ. лицо' : 'Юр. лицо'
        },
        {
          headerName: 'Депозит', field: 'deposit', minWidth: 150, flex: 0.5,
          filter: 'agNumberColumnFilter',
          cellRenderer: params => {
            const span = createElement('span', {
              classes: ['table-span-price'],
              content: params.value ? formattingPrice(params.value) : '',
            })
            return cellRendererInput(params, { el: span })
          },
        },
        {
          headerName: 'Осталось дней', field: 'days_left', minWidth: 100, flex: 0.5,
          filter: 'agNumberColumnFilter',
          cellRenderer: params => createDaysLeftElement(params)
        }
      ],
      suppressColumnVirtualisation: true,
      onFilterOpened: (e) => {
        const field = e.column.colDef.field
        const filterWrapper = e.eGui.querySelector('.ag-filter-body-wrapper')
        const data = e.api.getGridOption('rowData')
        const fullCurrentData = uniqBy(this.data.map(obj => obj[field]))
        const currentData = uniqBy(data.map(obj => obj[field]))
        let dataWithoutCurrentFilter = []


        if (this.queryParams.filters) {
          if (Object.keys(this.queryParams.filters).length == 1 && Object.keys(this.queryParams.filters)[0] == field) {
            dataWithoutCurrentFilter = fullCurrentData.filter(value => !currentData.includes(value))
          } else if (Object.keys(this.queryParams.filters).length >= 2) {
            dataWithoutCurrentFilter = this.filterAndSortData(this.data, {
              ...this.queryParams,
              filters: Object.keys(this.queryParams.filters).reduce((filteredObj, key) => {
                if (key !== field) {
                  filteredObj[key] = this.queryParams.filters[key];
                }
                return filteredObj;
              }, {})
            })
              .map(obj => obj[field])
              .filter(value => !currentData.includes(value))
          }
        }

        const params = { ...e, filterWrapper, currentData, data, fullCurrentData, dataWithoutCurrentFilter }

        this.customFilter.init(params)
        this.customFilter.gridApi = this.gridApi
        this.customFilter.render(params)
        this.customFilter.onChange = (queryParams) => {
          // this.changeQueryParams(queryParams)
          this.queryParams = queryParams
          this.tableRendering(queryParams)
        }
        this.customFilter.onChangeColumnParams = (params) => {
          e.column.colDef.filterValues = merge(e.column.colDef.filterValues || {}, params)
        }
      }, // сработает при открытие окна с фильтром
      onFilterChanged: (e) => {
        console.log('Фильтр изменен');
      },
      defaultColDef: {
        filter: "agTextColumnFilter",
        floatingFilter: true, // Добавляет панельку под заголовком
        closeOnApply: true,
        sortable: false,
        // filter: 'agSetColumnFilter'
      },
      pagination: false,
    };

    const defaultParams = { isPagination: false }

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);
    super(selector, mergedOptions, mergedParams);

    this.customFilter = new CustomFilter()
  }

  renderTextHeader(data) {
    const headersTable = this.table.querySelectorAll('.ag-header-cell')

    const func = (th, callback) => {
      const label = th.querySelector('.ag-header-cell-label')

      if (label.querySelector('.text-info')) return
      const spanText = th.querySelector('.ag-header-cell-text')
      let hName = spanText.innerText
      spanText.remove()

      const header = createElement('div', {
        classes: ['ag-header-cell-text', 'custom-header'],
        content: `${hName} <span class="text-info" style="font-size:12px;">${callback()}</span>`
      })

      label.prepend(header)
    }

    const obj = {
      2: th => func(th, () => formattingPrice(data.sum_amount)),
      3: th => func(th, () => data.cnt),
      5: th => func(th, () => data.sum_area + ' м²'),
      6: th => func(th, () => formattingPrice(data.avg_price)),
      8: th => func(th, () => formattingPrice(data.sum_deposit)),
    }

    headersTable.length && headersTable.forEach((th, i) => {
      obj[i]?.(th)
    })

  }

  changePagination({ page = 1, show_cnt = this.gridOptions.paginationPageSize, data = this.data }) {
    const cntAll = data.length
    const cntPages = Math.ceil(cntAll / show_cnt)

    const startIndex = (page - 1) * show_cnt;
    const endIndex = startIndex + show_cnt;

    const currentData = data.slice(startIndex, endIndex);

    // this.pagination.setPage(page, cntPages, cntAll)
    this.gridApi.setGridOption('rowData', data)
  }

  onRendering({ agreements = [], cnt_pages, page, cnt_all = 0, ...data }) {
    this.data = agreements
    this.cntAll = cnt_all
    this.customFilter.data = agreements
    this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, agreements.length])
    this.renderTextHeader(data)
    this.changePagination({ page })
  }

  filterAndSortData(data, params) {
    const { real_payment = -1, filters = {}, sort_column, sort_direction } = params;

    let result = data;

    if (real_payment !== -1) {
      result = result.filter(item => item.real_payment === real_payment);
    }

    // Фильтрация по объекту filters
    if (filters && Object.keys(filters).length > 0) {
      result = result.filter(item => {
        return Object.entries(filters).every(([key, values]) => {
          if (Array.isArray(values) && values.length) {
            return values.includes(String(item[key])); // Приводим к строке для совпадения
          }
          return true; // Пропускаем фильтр, если формат некорректный
        });
      });
    }

    // Сортировка
    if (sort_column && sort_direction) {
      result.sort((a, b) => {
        const valA = a[sort_column];
        const valB = b[sort_column];

        if (sort_direction === "asc") {
          return valA > valB ? 1 : valA < valB ? -1 : 0;
        } else if (sort_direction === "desc") {
          return valA < valB ? 1 : valA > valB ? -1 : 0;
        }
        return 0; // Если sort_direction некорректен
      });
    }
    console.log(params)

    return result;
  }

  tableRendering(queryParams = {}) {
    const data = this.filterAndSortData(this.data, queryParams)
    // console.log({ params: queryParams, filteredData: data, fullData: this.data })

    this.changePagination({ ...queryParams, data })
  }

  async download(data, isAll) {
    try {
      this.loader.enable()
      let reqData = {}

      if (isAll) {
        reqData.all_payments = 1
      } else {
        const writeIds = data.map(obj => obj.write_off_id)
        reqData.all_payments = 0
        reqData.write_off_ids = writeIds
      }

      const res = await downloadFuturePayments(reqData)
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      this.loader.disable()
    }
  }
}

export default TableUpcomingPayments