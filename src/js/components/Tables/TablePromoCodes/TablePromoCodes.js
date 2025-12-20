import Table from '../Table.js';
import { cellRendererInput, cellRendererSelect } from '../utils/cellRenderer.js';
import { editPromoCodes } from '../../../settings/request.js';

class TablePromoCodes extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Промокод',
          field: 'promocode',
          minWidth: 150,
          flex: 0.3,
          filter: 'agTextColumnFilter',
          floatingFilter: true,
          suppressMenu: true
        },
        {
          headerName: 'Вариант скидки',
          field: 'only_first_pay',
          minWidth: 150,
          flex: 0.3,
          filter: 'agTextColumnFilter',
          floatingFilter: true,
          suppressMenu: true,
          cellRenderer: params => this.createSelectCell(params, 'only_first_pay', [
            ['0', 'Все платежи'],
            ['1', 'Первый платеж']
          ])
        },
        {
          headerName: 'Распространяется на депозит',
          field: 'deposit_included',
          minWidth: 200,
          flex: 0.3,
          filter: 'agTextColumnFilter',
          floatingFilter: true,
          suppressMenu: true,
          cellRenderer: params => this.createSelectCell(params, 'deposit_included', [
            ['0', 'Нет'],
            ['1', 'Да']
          ])
        },
        {
          headerName: 'Тип скидки',
          field: 'sales_type',
          minWidth: 150,
          flex: 0.3,
          filter: 'agTextColumnFilter',
          floatingFilter: true,
          suppressMenu: true,
          cellRenderer: params => this.createSelectCell(params, 'sales_type', [
            ['1', 'Абсолют'],
            ['2', 'Процент']
          ])
        },
        {
          headerName: 'Значение',
          field: 'sale_value',
          minWidth: 120,
          flex: 0.3,
          filter: 'agNumberColumnFilter',
          floatingFilter: true,
          suppressMenu: true,
          cellRenderer: params => this.createEditableCell(params, 'sale_value', 'decimal')
        }
      ],
      // pagination: false,
    };

    const defaultParams = {}; // isPagination: false

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);

    super(selector, mergedOptions, mergedParams);

    this.isEditMode = false;
    this.originalData = new Map();

    this.onReadyFunctions.push(() => {
      this.initButtons();
      this.updateButtonsState();
    });
  }

  createEditableCell(params, fieldName, inputmode = 'decimal') {
    if (!this.isEditMode) {
      return params.value !== undefined && params.value !== null ? params.value : '';
    }

    return cellRendererInput(params, {
      inputmode,
      name: fieldName
    });
  }

  createSelectCell(params, fieldName, options) {
    const currentValue = params.value !== undefined && params.value !== null ? String(params.value) : '0';

    if (!this.isEditMode) {
      const selectedOption = options.find(opt => opt[0] === currentValue);
      return selectedOption ? selectedOption[1] : '';
    }

    return cellRendererSelect(params, {
      options,
      onSelect: (value) => {
        const numValue = parseInt(value) || 0;
        params.data[fieldName] = numValue;
        params.setValue(numValue);
      }
    });
  }

  initButtons() {
    const tableTop = this.wpTable?.querySelector('.table__top');
    if (!tableTop) return;

    this.btnEdit = tableTop.querySelector('.btn-edit-promo-codes');
    this.btnSave = tableTop.querySelector('.btn-save-promo-codes');
    this.btnCancel = tableTop.querySelector('.btn-cancel-promo-codes');

    this.btnEdit?.addEventListener('click', () => this.handleClickBtnEdit());
    this.btnSave?.addEventListener('click', () => this.handleClickBtnSave());
    this.btnCancel?.addEventListener('click', () => this.handleClickBtnCancel());
  }

  updateButtonsState() {
    this.btnEdit?.classList.toggle('_none', this.isEditMode);
    this.btnSave?.classList.toggle('_none', !this.isEditMode);
    this.btnCancel?.classList.toggle('_none', !this.isEditMode);
  }

  enableEditMode() {
    if (this.isEditMode) return;

    this.isEditMode = true;
    this.updateButtonsState();
    this.originalData.clear();

    const rowsWithElements = this.getAllRowsWithElements();

    rowsWithElements.forEach(({ data, element }) => {
      const rowId = element?.getAttribute('row-id');
      if (rowId) {
        this.originalData.set(rowId, { ...data });
      }
    });

    this.gridApi.refreshCells({ force: true });

    setTimeout(() => {
      const rowsWithElements = this.getAllRowsWithElements();
      rowsWithElements.forEach(({ element }) => {
        const inputs = element?.querySelectorAll('input[type="text"]');
        inputs?.forEach(input => {
          this.changeReadonly(input, false);
        });
      });
    }, 100);

    this.updateButtonsState();
  }

  disableEditMode() {
    const rowsWithElements = this.getAllRowsWithElements();

    rowsWithElements.forEach(({ element }) => {
      const inputs = element?.querySelectorAll('input[type="text"]');
      inputs?.forEach(input => this.changeReadonly(input, true));
    });

    this.isEditMode = false;
    this.updateButtonsState();
    this.gridApi.refreshCells({ force: true });
  }

  handleClickBtnEdit() {
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
    const promocodes = [];
    const rowsWithElements = this.getAllRowsWithElements();

    rowsWithElements.forEach(({ data, element }) => {
      if (!element) return;

      const updatedData = { ...data };

      // Собираем значения из текстовых инпутов (промокод и значение скидки)
      const inputs = element.querySelectorAll('input[type="text"]');
      inputs.forEach(input => {
        const fieldName = input.name;
        if (fieldName === 'sale_value') {
          updatedData[fieldName] = this.parseNumericValue(input.value);
        } else {
          updatedData[fieldName] = input.value;
        }
      });

      // Значения селектов уже обновлены в data через onSelect
      // Просто убедимся, что они числовые
      if (updatedData.only_first_pay !== undefined) {
        updatedData.only_first_pay = parseInt(updatedData.only_first_pay) || 0;
      }
      if (updatedData.deposit_included !== undefined) {
        updatedData.deposit_included = parseInt(updatedData.deposit_included) || 0;
      }
      if (updatedData.sales_type !== undefined) {
        updatedData.sales_type = parseInt(updatedData.sales_type) || 0;
      }

      promocodes.push(updatedData);
    });

    return promocodes;
  }

  async handleClickBtnSave() {
    if (!this.isEditMode) return;

    const promocodes = this.collectChanges();

    if (!promocodes.length) {
      this.disableEditMode();
      this.originalData.clear();
      return;
    }

    try {
      this.loader.enable();

      const { msg, msg_type } = await editPromoCodes({ promocodes });

      if (msg && msg_type) {
        this.app.notify?.show?.({ msg, msg_type });
      } else {
        this.app.notify?.show?.({ msg: 'Ошибка сохранения', msg_type: 'error' });
      }

      this.disableEditMode();
      this.originalData.clear();
      await this.refresh(this.queryParams);
    } catch (error) {
      console.error('Ошибка сохранения', error);
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

  onRendering({ promocodes = [], cnt_pages, page, cnt_all = 0 }) {
    this.cntAll = cnt_all;
    this.gridApi.setGridOption('rowData', promocodes);
  }
}

export default TablePromoCodes;
