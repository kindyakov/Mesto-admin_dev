import Table from '../Table.js';
import CategoryHeader from './CategoryHeader.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';

const isTotalRow = params => params?.data?.warehouseName === 'ИТОГО';
const totalCellClass = params => (isTotalRow(params) ? 'budget-total-cell' : undefined);

const createBaseColumns = () => ([
  {
    headerName: 'Дата',
    field: 'month',
    minWidth: 125,
    flex: 0.3,
    headerClass: 'budget-header-main',
    resizable: false,
    cellClass: totalCellClass,
    valueFormatter: params => (params.value ? dateFormatter(params.value, 'MMMM yyyy') : '')
  },
  {
    headerName: 'Склад',
    field: 'warehouseName',
    minWidth: 80,
    flex: 0.2,
    resizable: false,
    headerClass: 'budget-header-main',
    cellClass: totalCellClass
  },
  {
    headerName: 'Выручка от аренды',
    field: 'revenue',
    minWidth: 200,
    flex: 0.4,
    headerClass: 'budget-header-default',
    resizable: false,
    cellClass: totalCellClass
  },
  {
    headerName: 'Расходы',
    field: 'expenses',
    minWidth: 120,
    flex: 0.4,
    headerClass: 'budget-header-default',
    resizable: false,
    cellClass: totalCellClass,
    valueFormatter: params => params.value || params.value === 0 ? formattingPrice(params.value) : '0'
  },
  {
    headerName: 'Прибыль',
    field: 'profit',
    minWidth: 120,
    flex: 0.4,
    headerClass: 'budget-header-default',
    resizable: false,
    cellClass: totalCellClass,
    valueFormatter: params => params.value || params.value === 0 ? formattingPrice(params.value) : '0'
  }
]);

const normalizeCategoryKey = category => {
  if (!category) return '';
  return category
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\wа-яё\d]/gi, '_');
};

const getSubcategoryField = (category, subcategory) => `${normalizeCategoryKey(category)}__${normalizeCategoryKey(subcategory)}`;

class TableBudget extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: createBaseColumns(),
      pagination: false,
    };

    const defaultParams = {
      isPagination: false
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);
    super(selector, mergedOptions, mergedParams);

    this.expandedCategories = new Set();
    this.latestData = null;
    this.showFact = true;
    this.showPlan = false;
    this.handleToggleCategory = this.handleToggleCategory.bind(this);
    this.refreshGrid = this.refreshGrid.bind(this);
  }

  getWarehouseName(warehouseId) {
    if (warehouseId === 0) return 'ИТОГО';
    const warehouses = this.app?.warehouses || window?.app?.warehouses || [];
    const found = warehouses.find(item => item?.warehouse_id === warehouseId || item?.id === warehouseId);

    return found?.name || found?.warehouse_short_name || String(warehouseId ?? '');
  }

  createValueRenderer(factField, planField) {
    return params => {
      const fact = params?.data?.[factField];
      const plan = params?.data?.[planField];
      const hasFact = fact !== undefined && fact !== null;
      const hasPlan = plan !== undefined && plan !== null;

      const format = value => (value || value === 0 ? formattingPrice(value) : '');

      if (this.showFact && !this.showPlan) {
        return format(fact);
      }

      if (!this.showFact && this.showPlan) {
        return format(plan);
      }

      if (this.showFact && this.showPlan && (hasFact || hasPlan)) {
        const factNum = typeof fact === 'number' ? fact : null;
        const planNum = typeof plan === 'number' ? plan : null;
        let color = '#6b7280'; // нейтральный серый

        if (factNum !== null && planNum !== null) {
          if (factNum > planNum) color = '#16a34a'; // зеленый
          else if (factNum === planNum) color = '#ca8a04'; // желтый
          else color = '#dc2626'; // красный
        }

        const factText = format(fact);
        const planText = format(plan);

        const container = document.createElement('div');
        container.className = 'flex items-center gap-1';

        const factEl = document.createElement('span');
        factEl.style.color = color;
        factEl.textContent = factText || '';

        const separator = document.createElement('span');
        separator.textContent = ' / ';

        const planEl = document.createElement('span');
        planEl.textContent = planText || '';

        container.append(factEl, separator, planEl);
        return container;
      }

      return '';
    };
  }

  buildCategoryColumns(categories = [], subcategoriesMap = {}) {
    const columns = [];

    categories.forEach((category, i) => {
      const expanded = this.expandedCategories.has(category);
      const width = (category.length * 9.5 + 50);
      const minWidth = width < 160 ? 160 : width;
      const field = normalizeCategoryKey(category);
      const planField = `${field}__plan`;

      columns.push({
        headerName: category,
        field,
        minWidth,
        flex: 0.4,
        resizable: false, // categories.length - 1 !== i
        headerComponent: CategoryHeader,
        headerComponentParams: {
          category,
          expanded,
          onToggle: this.handleToggleCategory
        },
        headerClass: 'budget-header-default',
        cellRenderer: this.createValueRenderer(field, planField)
      });

      if (expanded && subcategoriesMap[category]?.length) {
        subcategoriesMap[category].forEach(subcategory => {
          const width = subcategory.length * 9.5 + 50;
          const minWidth = width < 100 ? 100 : width;
          const subField = getSubcategoryField(category, subcategory);
          const subPlanField = `${subField}__plan`;

          columns.push({
            headerName: subcategory || 'Без названия',
            field: subField,
            resizable: false, // subcategoriesMap[category].length - 1 !== i
            minWidth,
            flex: 0.35,
            headerClass: 'budget-header-sub',
            cellRenderer: this.createValueRenderer(subField, subPlanField)
          });
        });
      }
    });

    return columns;
  }

  collectCategories(factByCategory = [], factBySubcategory = [], planByCategory = [], planBySubcategory = []) {
    const uniqueCategories = [];
    const addUnique = category => {
      if (!category) return;
      if (!uniqueCategories.includes(category)) {
        uniqueCategories.push(category);
      }
    };

    factByCategory.forEach(item => addUnique(item.category));
    factBySubcategory.forEach(item => addUnique(item.category));
    planByCategory.forEach(item => addUnique(item.category));
    planBySubcategory.forEach(item => addUnique(item.category));

    return uniqueCategories;
  }

  collectSubcategories(factBySubcategory = [], planBySubcategory = []) {
    const subcategoryMap = {};

    factBySubcategory.forEach(item => {
      if (!item?.category || !item?.subcategory) return;
      if (!subcategoryMap[item.category]) {
        subcategoryMap[item.category] = [];
      }
      if (!subcategoryMap[item.category].includes(item.subcategory)) {
        subcategoryMap[item.category].push(item.subcategory);
      }
    });

    planBySubcategory.forEach(item => {
      if (!item?.category || !item?.subcategory) return;
      if (!subcategoryMap[item.category]) {
        subcategoryMap[item.category] = [];
      }
      if (!subcategoryMap[item.category].includes(item.subcategory)) {
        subcategoryMap[item.category].push(item.subcategory);
      }
    });

    return subcategoryMap;
  }

  buildRows({
    planfact_revenue = [],
    expenses = [],
    incomes = [],
    fact_by_category = [],
    fact_by_subcategory = [],
    plan_by_category = [],
    plan_by_subcategory = []
  }) {
    const rowsMap = new Map();
    const getKey = ({ warehouse_id, month }) => `${warehouse_id || 0}-${month}`;
    const ensureRow = ({ warehouse_id = 0, month }) => {
      const key = getKey({ warehouse_id, month });
      if (!rowsMap.has(key)) {
        rowsMap.set(key, {
          month,
          warehouseId: warehouse_id,
          warehouseName: this.getWarehouseName(warehouse_id),
          revenue: 0,
          revenuePlan: 0,
          expenses: 0,
          profit: 0
        });
      }
      return rowsMap.get(key);
    };

    planfact_revenue.forEach(item => {
      const row = ensureRow(item);
      row.revenue = item.revenue ?? row.revenue;
      row.revenuePlan = item.revenue_planned ?? row.revenuePlan;
    });

    expenses.forEach(item => {
      const row = ensureRow(item);
      row.expenses = item.value ?? row.expenses;
    });

    incomes.forEach(item => {
      const row = ensureRow(item);
      row.profit = item.value ?? row.profit;
    });

    const categoriesWithFact = new Set();
    const categoriesWithPlan = new Set();

    fact_by_category.forEach(item => {
      const row = ensureRow(item);
      const field = normalizeCategoryKey(item.category);
      row[field] = item.value ?? 0;
      categoriesWithFact.add(item.category);
    });

    plan_by_category.forEach(item => {
      const row = ensureRow(item);
      const field = `${normalizeCategoryKey(item.category)}__plan`;
      row[field] = item.value ?? 0;
      categoriesWithPlan.add(item.category);
    });

    // Если для категории нет общего значения, добиваем суммой подкатегорий
    fact_by_subcategory.forEach(item => {
      const row = ensureRow(item);
      const categoryField = normalizeCategoryKey(item.category);
      const subcategoryField = getSubcategoryField(item.category, item.subcategory || 'subcategory');

      const currentCategory = row[categoryField] || 0;
      const currentSub = row[subcategoryField] || 0;

      if (!categoriesWithFact.has(item.category)) {
        row[categoryField] = currentCategory + (item.value ?? 0);
      }

      row[subcategoryField] = currentSub + (item.value ?? 0);
    });

    plan_by_subcategory.forEach(item => {
      const row = ensureRow(item);
      const categoryField = `${normalizeCategoryKey(item.category)}__plan`;
      const subcategoryField = `${getSubcategoryField(item.category, item.subcategory || 'subcategory')}__plan`;

      const currentCategory = row[categoryField] || 0;
      const currentSub = row[subcategoryField] || 0;

      if (!categoriesWithPlan.has(item.category)) {
        row[categoryField] = currentCategory + (item.value ?? 0);
      }

      row[subcategoryField] = currentSub + (item.value ?? 0);
    });

    // Если прибыль не пришла, считаем как выручка - расходы
    rowsMap.forEach(row => {
      if (row.profit === 0 && (row.revenue || row.expenses)) {
        row.profit = (row.revenue || 0) - (row.expenses || 0);
      }
    });

    return Array.from(rowsMap.values());
  }

  handleToggleCategory(category) {
    if (this.expandedCategories.has(category)) {
      this.expandedCategories.delete(category);
    } else {
      this.expandedCategories.add(category);
    }
    this.refreshGrid();
  }

  refreshGrid(data = this.latestData) {
    if (!this.gridApi || !data) return;

    const {
      planfact_revenue = [],
      expenses = [],
      incomes = [],
      fact_by_category = [],
      fact_by_subcategory = [],
      plan_by_category = [],
      plan_by_subcategory = []
    } = data || {};

    const categories = this.collectCategories(fact_by_category, fact_by_subcategory, plan_by_category, plan_by_subcategory);
    const subcategoriesMap = this.collectSubcategories(fact_by_subcategory, plan_by_subcategory);

    const columnDefs = [
      ...createBaseColumns(),
      ...this.buildCategoryColumns(categories, subcategoriesMap)
    ];

    const revenueRenderer = this.createValueRenderer('revenue', 'revenuePlan');
    const revenueColumn = columnDefs.find(col => col.field === 'revenue');
    if (revenueColumn) {
      revenueColumn.cellRenderer = revenueRenderer;
      delete revenueColumn.valueFormatter;
    }

    const rows = this.buildRows({
      planfact_revenue,
      expenses,
      incomes,
      fact_by_category,
      fact_by_subcategory,
      plan_by_category,
      plan_by_subcategory
    });

    const totalsRows = rows.filter(row => row.warehouseId === 0);
    const regularRows = rows.filter(row => row.warehouseId !== 0);

    this.gridApi.setGridOption('columnDefs', columnDefs);
    // this.gridApi.setGridOption('pinnedTopRowData', totalsRows);
    // this.gridApi.setGridOption('rowData', regularRows);
    this.gridApi.setGridOption('pinnedTopRowData', []);
    this.gridApi.setGridOption('rowData', [...totalsRows, ...regularRows]);
  }

  onRendering(data) {
    if (!data) return;
    this.latestData = data;
    this.refreshGrid(data);
  }

  setDisplayMode({ showFact = this.showFact, showPlan = this.showPlan } = {}) {
    this.showFact = showFact;
    this.showPlan = showPlan;
    this.refreshGrid();
  }
}

export default TableBudget;
