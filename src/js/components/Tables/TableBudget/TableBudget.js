import Table from '../Table.js';
import CategoryHeader from './CategoryHeader.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { setBudgetPlan, setFinancePlan } from '../../../settings/request.js';

const isTotalRow = params => params?.data?.warehouseName === 'ИТОГО';
const totalCellClass = params => (isTotalRow(params) ? 'budget-total-cell' : undefined);

const createBaseColumns = () => ([
  {
    headerName: 'Дата',
    field: 'month',
    minWidth: 125,
    flex: 0.3,
    headerClass: 'budget-header-main',
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
    this.isEditMode = false;
    this.originalData = new Map();
    this.planFieldMeta = new Map();
    this.handleToggleCategory = this.handleToggleCategory.bind(this);
    this.refreshGrid = this.refreshGrid.bind(this);

    this.onReadyFunctions.push(() => {
      this.initButtons();
      this.updateButtonsState();
    });
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

  createEditableRenderer(factField, planField) {
    const viewRenderer = this.createValueRenderer(factField, planField);

    return params => {
      const planValue = params?.data?.[planField];
      const canEdit = this.showPlan && this.isEditMode && this.canEditRow(params?.data);

      if (canEdit) {
        const renderParams = {
          ...params,
          value: planValue,
          colDef: { ...params.colDef, field: planField }
        };

        return cellRendererInput(renderParams, {
          funcFormate: formattingPrice,
          inputmode: 'numeric',
          name: planField
        });
      }

      return viewRenderer(params);
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

      this.planFieldMeta.set(planField, { category, subcategory: null });

      columns.push({
        headerName: category,
        field,
        minWidth,
        flex: 0.4,
        // resizable: false, // categories.length - 1 !== i
        headerComponent: CategoryHeader,
        headerComponentParams: {
          category,
          expanded,
          onToggle: this.handleToggleCategory
        },
        headerClass: 'budget-header-default',
        cellRenderer: this.createEditableRenderer(field, planField)
      });

      if (expanded && subcategoriesMap[category]?.length) {
        subcategoriesMap[category].forEach(subcategory => {
          const width = subcategory.length * 9.5 + 50;
          const minWidth = width < 100 ? 100 : width;
          const subField = getSubcategoryField(category, subcategory);
          const subPlanField = `${subField}__plan`;

          this.planFieldMeta.set(subPlanField, { category, subcategory });

          columns.push({
            headerName: subcategory || 'Без названия',
            field: subField,
            // resizable: false, // subcategoriesMap[category].length - 1 !== i
            minWidth,
            flex: 0.35,
            headerClass: 'budget-header-sub',
            cellRenderer: this.createEditableRenderer(subField, subPlanField)
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
    this.planFieldMeta.clear();

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

    this.planFieldMeta.set('revenuePlan', { category: 'revenue', subcategory: null });

    const revenueRenderer = this.createEditableRenderer('revenue', 'revenuePlan');
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
    if (!this.showPlan && this.isEditMode) {
      this.handleClickBtnCancel();
    }
    this.updateButtonsState();
    this.refreshGrid();
  }

  initButtons() {
    const tableTop = this.wpTable?.querySelector('.table__top');
    if (!tableTop) return;

    this.btnEdit = tableTop.querySelector('.btn-edit-budget');
    this.btnSave = tableTop.querySelector('.btn-save-budget');
    this.btnCancel = tableTop.querySelector('.btn-cancel-budget');

    this.btnEdit?.addEventListener('click', () => this.handleClickBtnEdit());
    this.btnSave?.addEventListener('click', () => this.handleClickBtnSave());
    this.btnCancel?.addEventListener('click', () => this.handleClickBtnCancel());
  }

  updateButtonsState() {
    const hideEdit = !this.showPlan || this.isEditMode;
    this.btnEdit?.classList.toggle('_none', hideEdit);
    this.btnSave?.classList.toggle('_none', !this.isEditMode);
    this.btnCancel?.classList.toggle('_none', !this.isEditMode);
  }

  canEditRow(data) {
    return data && data.warehouseId !== 0;
  }

  enableEditMode() {
    if (this.isEditMode || !this.showPlan) return;

    this.isEditMode = true;
    this.updateButtonsState();
    this.gridApi.refreshCells({ force: true });
    this.originalData.clear();

    const rowsWithElements = this.getAllRowsWithElements();

    rowsWithElements.forEach(({ data, element }) => {
      if (!this.canEditRow(data)) return;

      const rowId = element?.getAttribute('row-id');
      if (rowId) {
        this.originalData.set(rowId, { ...data });
      }

      const inputs = element?.querySelectorAll('input[name$="__plan"], input[name="revenuePlan"]');
      inputs?.forEach(input => this.changeReadonly(input, false));
    });

    this.updateButtonsState();
  }

  disableEditMode() {
    const rowsWithElements = this.getAllRowsWithElements();

    rowsWithElements.forEach(({ element }) => {
      const inputs = element?.querySelectorAll('input[name$="__plan"], input[name="revenuePlan"]');
      inputs?.forEach(input => this.changeReadonly(input, true));
    });

    this.isEditMode = false;
    this.updateButtonsState();
    this.gridApi.refreshCells({ force: true });
  }

  handleClickBtnEdit() {
    if (!this.showPlan) return;
    this.enableEditMode();
  }

  restoreOriginalData() {
    this.originalData.forEach((data, rowId) => {
      const rowNode = this.gridApi.getRowNode(rowId);
      if (rowNode) {
        rowNode.setData({ ...data });
      }
    });
    this.gridApi.refreshCells({ force: true });
  }

  parseNumericValue(value) {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    const cleaned = String(value).replace(/\s/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  collectChanges() {
    const budgetPlans = [];
    const financePlans = [];

    const rowsWithElements = this.getAllRowsWithElements();

    rowsWithElements.forEach(({ data, element }) => {
      if (!this.canEditRow(data) || !element) return;
      const rowId = element.getAttribute('row-id');
      const original = this.originalData.get(rowId) || {};

      const inputs = element.querySelectorAll('input[name$="__plan"], input[name="revenuePlan"]');

      inputs.forEach(input => {
        const fieldName = input.name;
        const meta = this.planFieldMeta.get(fieldName);
        const newValue = this.parseNumericValue(input.value);
        const previousValue = this.parseNumericValue(original[fieldName]);

        if (newValue === previousValue) return;

        if (fieldName === 'revenuePlan') {
          financePlans.push({
            revenue_planned: newValue,
            data: data.month,
            month_or_day: 'month',
            warehouse_id: data.warehouseId
          });
        } else if (meta) {
          budgetPlans.push({
            month: data.month,
            warehouse_id: data.warehouseId,
            category: meta.category,
            subcategory: meta.subcategory,
            value: newValue
          });
        }
      });
    });

    return { budgetPlans, financePlans };
  }

  async handleClickBtnSave() {
    if (!this.isEditMode) return;

    const { budgetPlans, financePlans } = this.collectChanges();

    if (!budgetPlans.length && !financePlans.length) {
      this.disableEditMode();
      this.originalData.clear();
      return;
    }

    try {
      this.loader.enable();

      if (budgetPlans.length) {
        await setBudgetPlan({ budget_plans: budgetPlans });
      }

      if (financePlans.length) {
        for (const payload of financePlans) {
          // Отправляем каждое изменение выручки отдельным запросом
          await setFinancePlan(payload);
        }
      }

      this.app.notify?.show?.({ msg: 'План сохранён', msg_type: 'success' });

      this.disableEditMode();
      this.originalData.clear();
      await this.refresh(this.queryParams);
    } catch (error) {
      console.error('Ошибка сохранения плана', error);
      this.app.notify?.show?.({ msg: 'Ошибка сохранения', msg_type: 'error' });
    } finally {
      this.loader.disable();
    }
  }

  handleClickBtnCancel() {
    if (!this.isEditMode) return;
    if (this.originalData.size) {
      this.restoreOriginalData();
    }
    this.disableEditMode();
    this.originalData.clear();
  }
}

export default TableBudget;
