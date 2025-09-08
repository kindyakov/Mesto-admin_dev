// HeaderSync.js
export class HeaderSync {
  constructor(wpTable, gridApi) {
    this.wpTable = wpTable;
    this.gridApi = gridApi;
    this.headerTitles = null;
    this.headerContainer = null;
    this.agHeader = null;
    this.tableViewport = null;
    this.isScrollListenerAdded = false;
    this.hiddenSections = new Set(); // Хранит скрытые секции
    this.originalPositions = new Map(); // Сохраняем оригинальные позиции заголовков
    this.movedHeaders = new Map(); // Отслеживаем перемещенные заголовки
  }

  init() {
    this.headerTitles = this.wpTable.querySelectorAll('.table-title');
    this.headerContainer = this.headerTitles[0]?.parentElement;
    this.agHeader = this.wpTable.querySelector('.ag-header-row');
    this.tableViewport = this.wpTable.querySelector('.ag-body-horizontal-scroll-viewport') ||
      this.wpTable.querySelector('.ag-body-viewport');

    if (!this.headerTitles.length || !this.agHeader || !this.tableViewport) {
      console.warn('HeaderSync: Required elements not found');
      return false;
    }

    // Сохраняем оригинальные позиции всех заголовков
    this.headerTitles.forEach((header, index) => {
      this.originalPositions.set(index, {
        parent: header.parentNode,
        nextSibling: header.nextSibling
      });
    });

    this.setupScrollSync();
    this.setupToggleButtons();
    this.syncWidths();
    return true;
  }

  setupToggleButtons() {
    this.headerTitles.forEach((header, index) => {
      const toggleBtn = header.querySelector('button');
      if (!toggleBtn) return;

      toggleBtn.addEventListener('click', () => {
        this.toggleSection(index);
      });
    });
  }

  toggleSection(sectionIndex) {
    if (this.hiddenSections.has(sectionIndex)) {
      this.showSection(sectionIndex);
    } else {
      this.hideSection(sectionIndex);
    }
  }

  hideSection(sectionIndex, gridApi = this.gridApi) {
    const columnGroups = this.getColumnGroups(gridApi);
    const columnsToHide = columnGroups[sectionIndex] || [];

    columnsToHide.forEach(col => {
      gridApi?.setColumnVisible(col.colId, false);
    });

    this.hiddenSections.add(sectionIndex);
    this.updateToggleButton(sectionIndex, true);
    this.moveHeaderToTop(sectionIndex);
  }

  showSection(sectionIndex, gridApi = this.gridApi) {
    const columnGroups = this.getColumnGroups(gridApi);
    const columnsToShow = columnGroups[sectionIndex] || [];

    columnsToShow.forEach(col => {
      gridApi?.setColumnVisible(col.colId, true);
    });

    this.hiddenSections.delete(sectionIndex);
    this.updateToggleButton(sectionIndex, false);
    this.moveHeaderBack(sectionIndex);
  }

  moveHeaderToTop(sectionIndex) {
    const header = this.headerTitles[sectionIndex];
    if (!header || this.movedHeaders.has(sectionIndex)) return;

    // Перемещаем в начало wpTable
    this.wpTable.insertBefore(header, this.wpTable.firstChild);
    this.movedHeaders.set(sectionIndex, true);

    console.log(`Заголовок секции ${sectionIndex} перемещен в начало`);
  }

  moveHeaderBack(sectionIndex) {
    const header = this.headerTitles[sectionIndex];
    const originalPosition = this.originalPositions.get(sectionIndex);

    if (!header || !originalPosition || !this.movedHeaders.has(sectionIndex)) return;

    // Возвращаем на оригинальную позицию
    if (originalPosition.nextSibling) {
      originalPosition.parent.insertBefore(header, originalPosition.nextSibling);
    } else {
      originalPosition.parent.appendChild(header);
    }

    this.movedHeaders.delete(sectionIndex);
    console.log(`Заголовок секции ${sectionIndex} возвращен на место`);
  }

  updateToggleButton(sectionIndex, isHidden) {
    const header = this.headerTitles[sectionIndex];
    const toggleBtn = header?.querySelector('button');
    const icon = toggleBtn?.querySelector('svg use');

    if (icon) {
      // icon.setAttribute('xlink:href', isHidden ? '#show' : '#no-show');
    }
  }

  getColumnGroups(gridApi) {
    if (!gridApi) return [[], [], []];

    const columnState = gridApi.getColumnState();
    const hasAccordion = window.app?.warehouse?.warehouse_id === 0;
    const offset = hasAccordion ? 1 : 0; // Сдвигаем индексы если есть аккордион

    return [
      columnState.slice(0, 6 + offset),   // ВЫРУЧКА 
      columnState.slice(6 + offset, 10 + offset),  // ПРОДАЖА
      columnState.slice(10 + offset)      // МАРКЕТИНГ
    ];
  }

  setupScrollSync() {
    if (this.isScrollListenerAdded || !this.headerContainer || !this.tableViewport) return;

    this.tableViewport.addEventListener('scroll', () => {
      this.headerContainer.scrollLeft = this.tableViewport.scrollLeft;
    });

    this.isScrollListenerAdded = true;
  }

  syncWidths(gridApi = this.gridApi) {
    if (!gridApi || !this.headerTitles?.length || !this.headerContainer) return;

    this.headerContainer.style.maxWidth = 0;
    this.headerContainer.style.maxWidth = `${this.wpTable.offsetWidth}px`;

    // Получаем ВСЕ колонки (включая скрытые)
    const columnState = gridApi.getColumnState();

    // Определяем группы колонок по индексам (не зависит от видимости)
    const sectionRanges = [
      { start: 0, end: 6 },   // ВЫРУЧКА (0-5 колонки)
      { start: 6, end: 10 },  // ПРОДАЖА (6-9 колонки)  
      { start: 10, end: columnState.length } // МАРКЕТИНГ (10+ колонки)
    ];

    this.headerTitles.forEach((header, sectionIndex) => {
      const isHidden = this.hiddenSections.has(sectionIndex);
      const isMoved = this.movedHeaders.has(sectionIndex);

      if (isHidden && isMoved) {
        // Заголовок уже перемещен, только обновляем размеры
        header.style.width = '150px';
        header.style.minWidth = '150px';
        header.style.maxWidth = '150px';
        return;
      }

      if (isHidden) {
        // Секция скрыта но заголовок еще не перемещен - перемещаем
        this.moveHeaderToTop(sectionIndex);
        return;
      }

      // Видимая секция - обычная синхронизация
      const range = sectionRanges[sectionIndex];
      const sectionColumns = columnState
        .slice(range.start, range.end)
        .filter(col => !col.hide);

      if (sectionColumns.length === 0) {
        header.style.display = 'none';
        return;
      }

      header.style.display = '';

      // Суммируем ширину видимых колонок секции
      const totalWidth = sectionColumns.reduce((sum, col) => sum + (col.width || 0), 0);

      header.style.width = `${totalWidth}px`;
      header.style.minWidth = `${totalWidth}px`;
      header.style.maxWidth = `${totalWidth}px`;
      header.style.flex = 'none';
    });
  }

  // Метод для обновления группировки колонок если структура изменится
  updateColumnGroups(groups) {
    this.columnGroups = groups;
    this.syncWidths();
  }

  // Уничтожение слушателей при необходимости
  destroy() {
    // Возвращаем все заголовки на места
    this.movedHeaders.forEach((_, sectionIndex) => {
      this.moveHeaderBack(sectionIndex);
    });

    this.isScrollListenerAdded = false;
    this.originalPositions.clear();
    this.movedHeaders.clear();
  }
}