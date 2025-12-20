import Table from '../Table.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { editRooms } from '../../../settings/request.js';
import { applyTableFilterMixin } from '../mixins/TableFilterMixin.js';

const TableWithFilters = applyTableFilterMixin(Table);

class TableCells extends TableWithFilters {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Ячейка',
          field: 'room_name',
          minWidth: 100,
          flex: 0.4,
          filter: 'agTextColumnFilter'
        },
        {
          headerName: 'Длина',
          field: 'length',
          minWidth: 90,
          flex: 0.3,
          filter: 'agNumberColumnFilter',
          cellRenderer: params => this.createEditableCell(params, 'length', 'decimal')
        },
        {
          headerName: 'Ширина',
          field: 'width',
          minWidth: 100,
          flex: 0.3,
          filter: 'agNumberColumnFilter',
          cellRenderer: params => this.createEditableCell(params, 'width', 'decimal')
        },
        {
          headerName: 'Высота',
          field: 'height',
          minWidth: 100,
          flex: 0.3,
          filter: 'agNumberColumnFilter',
          cellRenderer: params => this.createEditableCell(params, 'height', 'decimal')
        },
        {
          headerName: 'Площадь',
          field: 'area',
          minWidth: 100,
          flex: 0.3,
          filter: 'agNumberColumnFilter',
          valueFormatter: params => params.value ? params.value.toFixed(1) : ''
        },
        {
          headerName: 'Объем',
          field: 'volume',
          minWidth: 100,
          flex: 0.3,
          filter: 'agNumberColumnFilter',
          valueFormatter: params => params.value ? params.value.toFixed(1) : ''
        },
        {
          headerName: 'Цена 1 мес',
          field: 'price',
          minWidth: 110,
          flex: 0.3,
          filter: 'agNumberColumnFilter',
          cellRenderer: params => this.createPriceCell(params, 'price')
        },
        {
          headerName: 'Цена 6 мес',
          field: 'price_6m',
          minWidth: 120,
          flex: 0.3,
          filter: 'agNumberColumnFilter',
          cellRenderer: params => this.createPriceCell(params, 'price_6m')
        },
        {
          headerName: 'Цена 11 мес',
          field: 'price_11m',
          minWidth: 120,
          flex: 0.3,
          filter: 'agNumberColumnFilter',
          cellRenderer: params => this.createPriceCell(params, 'price_11m')
        },
        {
          headerName: 'Индивидуальная цена',
          field: 'individual_price',
          minWidth: 150,
          flex: 0.3,
          filter: 'agNumberColumnFilter',
          cellRenderer: params => this.createCheckboxCell(params, 'individual_price')
        },
        {
          headerName: 'Выведена на сайт',
          field: 'show_on_website',
          minWidth: 150,
          flex: 0.3,
          filter: 'agNumberColumnFilter',
          cellRenderer: params => this.createCheckboxCell(params, 'show_on_website')
        },
        {
          headerName: 'Построена',
          field: 'real_room',
          minWidth: 110,
          flex: 0.3,
          filter: 'agNumberColumnFilter',
          cellRenderer: params => this.createCheckboxCell(params, 'real_room')
        }
      ],
      pagination: false,
    };

    const defaultParams = {
      isPagination: false
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);

    super(selector, mergedOptions, mergedParams);

    this.isEditMode = false;
    this.originalData = new Map();

    // Инициализация фильтрации полностью происходит в миксине TableFilterMixin

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

  createPriceCell(params, fieldName) {
    const isIndividual = params.data?.individual_price === 1;

    if (!this.isEditMode || !isIndividual) {
      return params.value !== undefined && params.value !== null ? formattingPrice(params.value) : '';
    }

    return cellRendererInput(params, {
      inputmode: 'numeric',
      funcFormate: formattingPrice,
      name: fieldName
    });
  }

  createCheckboxCell(params, fieldName) {
    const checked = params.value === 1;

    if (!this.isEditMode) {
      return checked ? 'Да' : 'Нет';
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checked;
    checkbox.classList.add('cell-checkbox');
    checkbox.name = fieldName;

    checkbox.addEventListener('change', (e) => {
      params.data[fieldName] = e.target.checked ? 1 : 0;
      params.setValue(e.target.checked ? 1 : 0);

      // Если изменили individual_price, обновляем ячейки цен
      if (fieldName === 'individual_price' && this.isEditMode) {
        this.gridApi.refreshCells({
          rowNodes: [params.node],
          columns: ['price', 'price_6m', 'price_11m'],
          force: true
        });

        // Разблокируем новые инпуты цен после рендеринга
        setTimeout(() => {
          const rowElement = params.eGridCell?.closest('.ag-row');
          if (rowElement && e.target.checked) {
            const priceInputs = rowElement.querySelectorAll('input[name="price"], input[name="price_6m"], input[name="price_11m"]');
            priceInputs.forEach(input => this.changeReadonly(input, false));
          }
        }, 50);
      }
    });

    return checkbox;
  }

  initButtons() {
    const tableTop = this.wpTable?.querySelector('.table__top');
    if (!tableTop) return;

    this.btnEdit = tableTop.querySelector('.btn-edit-cells');
    this.btnSave = tableTop.querySelector('.btn-save-cells');
    this.btnCancel = tableTop.querySelector('.btn-cancel-cells');

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

    // Перерисовываем таблицу для отображения редактируемых ячеек
    this.gridApi.refreshCells({ force: true });

    // Делаем inputs редактируемыми
    setTimeout(() => {
      const rowsWithElements = this.getAllRowsWithElements();
      rowsWithElements.forEach(({ element }) => {
        const inputs = element?.querySelectorAll('input[type="text"], input[type="checkbox"]');
        inputs?.forEach(input => {
          if (input.type === 'text') {
            this.changeReadonly(input, false);
          }
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
    const rooms = [];
    const rowsWithElements = this.getAllRowsWithElements();

    rowsWithElements.forEach(({ data, element }) => {
      if (!element) return;

      const updatedData = { ...data };

      // Собираем значения из текстовых инпутов
      const inputs = element.querySelectorAll('input[type="text"]');
      inputs.forEach(input => {
        const fieldName = input.name;
        const value = this.parseNumericValue(input.value);
        updatedData[fieldName] = value;
      });

      // Собираем значения из чекбоксов
      const checkboxes = element.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        const fieldName = checkbox.name;
        updatedData[fieldName] = checkbox.checked ? 1 : 0;
      });

      // Пересчитываем площадь и объем
      const length = updatedData.length || 0;
      const width = updatedData.width || 0;
      const height = updatedData.height || 0;

      updatedData.area = Math.round(length * width * 10) / 10;
      updatedData.volume = Math.round(length * width * height * 10) / 10;

      rooms.push(updatedData);
    });

    return rooms;
  }

  async handleClickBtnSave() {
    if (!this.isEditMode) return;

    const rooms = this.collectChanges();

    if (!rooms.length) {
      this.disableEditMode();
      this.originalData.clear();
      return;
    }

    try {
      this.loader.enable();

      const { msg, msg_type } = await editRooms({ rooms });

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

  onRendering({ rooms = [], cnt_pages, page, cnt_all = 0 }) {
    this.cntAll = cnt_all;
    this.dataSource = rooms;
    this.customFilter.data = rooms;
    if (this.pagination) {
      this.pagination.setPage(page, cnt_pages, cnt_all);
    }
    this.tableRendering(this.queryParams);
  }
}

export default TableCells;
