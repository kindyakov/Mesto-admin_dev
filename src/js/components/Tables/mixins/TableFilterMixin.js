import CustomFilter from '../utils/CustomFilter/CustomFilter.js';

/**
 * Миксин для добавления фильтрации к таблицам
 * Использование: applyTableFilterMixin(TableClass)
 */
export function applyTableFilterMixin(BaseClass) {
  return class extends BaseClass {
    constructor(selector, options, params) {
      // Добавляем настройки фильтрации к опциям таблицы
      const filterOptions = {
        onFilterOpened: e => this.handleFilterOpened(e),
        defaultColDef: {
          ...options.defaultColDef,
          filter: 'agTextColumnFilter',
          floatingFilter: true,
          closeOnApply: true,
          sortable: true
        }
      };

      const mergedOptions = {
        ...options,
        ...filterOptions,
        defaultColDef: {
          ...(options.defaultColDef || {}),
          ...filterOptions.defaultColDef
        }
      };

      super(selector, mergedOptions, params);

      // Инициализация фильтрации
      this.initializeFiltering();
    }

    initializeFiltering() {
      this.customFilter = new CustomFilter();
      this.customFilter.onChange = queryParams => {
        this.queryParams = queryParams;
        this.tableRendering(queryParams);
      };

      this.queryParams = this.queryParams || {};
      this.dataSource = [];
    }

    handleFilterOpened(e) {
      const field = e.column.colDef.field;
      const filterWrapper = e.eGui.querySelector('.ag-filter-body-wrapper');
      const data = e.api.getGridOption('rowData');

      const uniqueSorted = arr => Array.from(new Set(arr)).sort((a, b) => {
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
      });

      const fullCurrentData = uniqueSorted((this.dataSource || []).map(obj => obj[field]));
      const currentData = uniqueSorted((data || []).map(obj => obj[field]));
      let dataWithoutCurrentFilter = [];

      if (this.queryParams?.filters) {
        const filtersKeys = Object.keys(this.queryParams.filters);
        if (filtersKeys.length === 1 && filtersKeys[0] === field) {
          dataWithoutCurrentFilter = fullCurrentData.filter(value => !currentData.includes(value));
        } else if (filtersKeys.length >= 2) {
          dataWithoutCurrentFilter = this.filterAndSortData(this.dataSource, {
            ...this.queryParams,
            filters: filtersKeys.reduce((acc, key) => {
              if (key !== field) {
                acc[key] = this.queryParams.filters[key];
              }
              return acc;
            }, {})
          })
            .map(obj => obj[field])
            .filter(value => !currentData.includes(value));

          dataWithoutCurrentFilter = uniqueSorted(dataWithoutCurrentFilter);
        }
      }

      // Кастомный форматтер для лейблов (опционально)
      const labelFormatter = this.getFilterLabelFormatter?.(field) || null;

      const params = {
        ...e,
        filterWrapper,
        currentData,
        data,
        fullCurrentData,
        dataWithoutCurrentFilter,
        labelFormatter
      };

      this.customFilter.init(params);
      this.customFilter.gridApi = this.gridApi;
      this.customFilter.wpTable = this.wpTable;
      this.customFilter.render(params, this.queryParams);
      this.customFilter.onChangeColumnParams = columnParams => {
        e.column.colDef.filterValues = {
          ...(e.column.colDef.filterValues || {}),
          ...columnParams
        };
      };
    }

    filterAndSortData(data = [], params = {}) {
      const { filters = {}, sort_column, sort_direction } = params;
      let result = Array.isArray(data) ? [...data] : [];

      // Применение фильтров
      if (filters && Object.keys(filters).length > 0) {
        result = result.filter(item =>
          Object.entries(filters).every(([key, values]) => {
            if (Array.isArray(values) && values.length) {
              return values.includes(String(item[key]));
            }
            return true;
          })
        );
      }

      // Применение сортировки
      if (sort_column && sort_direction) {
        result.sort((a, b) => {
          const valA = a?.[sort_column];
          const valB = b?.[sort_column];

          if (valA === valB) return 0;
          if (sort_direction === 'asc') {
            return valA > valB ? 1 : -1;
          }
          if (sort_direction === 'desc') {
            return valA < valB ? 1 : -1;
          }
          return 0;
        });
      }

      return result;
    }

    tableRendering(queryParams = {}) {
      const data = this.filterAndSortData(this.dataSource, queryParams);
      this.cntAll = data.length;
      this.gridApi.setGridOption('rowData', data);

      // Вызываем кастомный рендеринг если есть
      this.onFilteredDataRendered?.(data, queryParams);
    }

    // Метод для переопределения в дочернем классе
    // Возвращает функцию форматирования лейбла для конкретного поля
    getFilterLabelFormatter(field) {
      return null;
    }

    // Метод для переопределения в дочернем классе
    // Вызывается после рендеринга отфильтрованных данных
    onFilteredDataRendered(data, queryParams) {
      // Переопределить в дочернем классе если нужна доп. логика
    }

    // Переопределение сброса фильтров для работы с customFilter
    handleClickFilterReset() {
      // Сбрасываем фильтры AG Grid
      this.gridApi?.setFilterModel(null);
      this.gridApi?.applyColumnState({
        defaultState: { sort: null }
      });

      // Сбрасываем наши кастомные фильтры
      this.queryParams = {};
      if (this.customFilter) {
        this.customFilter.reqData = { filters: {} };
      }

      // Убираем индикаторы активных фильтров
      const filterButtons = this.wpTable?.querySelectorAll('.ag-filter-active');
      filterButtons?.forEach(btn => btn.classList.remove('ag-filter-active'));

      // Перерисовываем таблицу с полными данными
      this.tableRendering(this.queryParams);
    }
  };
}
