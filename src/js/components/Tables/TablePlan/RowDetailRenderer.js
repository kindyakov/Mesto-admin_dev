/**
 * Класс для управления раскрывающимися строками в AG Grid Community
 * Работает через манипуляцию rowData, добавляя/удаляя детальные строки
 */
export class RowDetailRenderer {
  constructor(gridApi, getDetailDataCallback) {
    this.gridApi = gridApi;
    this.getDetailData = getDetailDataCallback;
    this.expandedRowId = null; // ID текущей раскрытой строки
    this.detailRowsMap = new Map(); // Хранит соответствие между родительской строкой и её деталями
  }

  /**
   * Переключает состояние строки (раскрыть/свернуть)
   * @param {Object} rowNode - Узел строки AG Grid
   * @param {HTMLElement} button - Кнопка аккордеона
   */
  toggle(rowNode) {
    const rowId = rowNode.id;
    const button = this.findButtonForRow(rowId);

    // Если эта строка уже раскрыта - сворачиваем
    if (this.expandedRowId === rowId) {
      this.collapse(rowId);
    } else {
      // Сначала сворачиваем предыдущую раскрытую строку
      if (this.expandedRowId !== null) {
        this.collapse(this.expandedRowId);
      }
      // Затем раскрываем новую
      this.expand(rowNode, button);
    }
  }

  /**
   * Раскрывает строку, добавляя под ней детальные данные
   */
  async expand(rowNode) {
    const rowId = rowNode.id;
    const rowData = rowNode.data;

    // Получаем детальные данные
    const detailData = await this.getDetailData(rowData);
    if (!detailData || !detailData.length) return;

    // Получаем текущие данные таблицы
    const allRowData = [];
    this.gridApi.forEachNode(node => {
      if (!node.data._isDetail) {
        allRowData.push(node.data);
      }
    });

    // Находим индекс текущей строки
    const currentIndex = allRowData.findIndex(row => {
      // Сравниваем по уникальному полю, например по дате
      return row.data === rowData.data;
    });

    if (currentIndex === -1) return;

    // Создаем детальные строки из полученных данных
    const detailRows = detailData.map(detail => {
      // Создаем объект детальной строки с теми же полями, что и основная
      // но с флагом _isDetail и специальным форматированием
      return {
        ...detail, // Используем все поля из детальных данных
        _isDetail: true,
        _parentId: rowId,
        _detailName: detail.data || 'Детальная информация', // Сохраняем название для отображения
        // Переопределяем поле data для отображения названия детали
        data: `    ↳ ${detail.data || 'Детальная информация'}` // Добавляем отступ и стрелку
      };
    });

    // Вставляем детальные строки после родительской
    const newRowData = [
      ...allRowData.slice(0, currentIndex + 1),
      ...detailRows,
      ...allRowData.slice(currentIndex + 1)
    ];

    // Обновляем данные в таблице
    this.gridApi.setGridOption('rowData', newRowData);

    // Сохраняем информацию о детальных строках
    this.detailRowsMap.set(rowId, detailRows);
    this.expandedRowId = rowId;

    setTimeout(() => {
      // Меняем иконку кнопки
      this.updateButtonIcon(this.findButtonForRow(rowId), true);
    }, 50)
  }

  /**
   * Сворачивает строку, удаляя детальные данные
   */
  collapse(rowId) {
    if (!this.detailRowsMap.has(rowId)) return;

    // Получаем все данные и фильтруем детальные строки
    const allRowData = [];
    this.gridApi.forEachNode(node => {
      if (!node.data._isDetail || node.data._parentId !== rowId) {
        allRowData.push(node.data);
      }
    });

    // Обновляем данные в таблице
    this.gridApi.setGridOption('rowData', allRowData);

    // Очищаем информацию
    this.detailRowsMap.delete(rowId);
    if (this.expandedRowId === rowId) {
      this.expandedRowId = null;
    }

    setTimeout(() => {
      // Меняем иконку кнопки
      this.updateButtonIcon(this.findButtonForRow(this.rowId), false);
    }, 50)
  }

  /**
   * Обновляет иконку кнопки
   */
  updateButtonIcon(button, isExpanded) {
    if (!button) return;

    const svg = isExpanded
      ? `<svg width="10" height="10" viewBox="0 0 4 1" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.75 0.749512H2.25H1.75H0.25V0.249512H1.75H2.25H3.75V0.749512Z" fill="#787B80"/>
        </svg>` // Минус когда раскрыто
      : `<svg width="15" height="15" viewBox="0 0 4 5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.75 2.74951H2.25V4.24951H1.75V2.74951H0.25V2.24951H1.75V0.749512H2.25V2.24951H3.75V2.74951Z" fill="#787B80"/>
        </svg>`; // Плюс когда свернуто

    button.innerHTML = svg;
  }

  /**
   * Находит кнопку для указанной строки
   */
  findButtonForRow(rowId) {
    const btn = document.querySelector(`.btn-accordion[data-row-id="${rowId}"]`)
    return btn ? btn : null;
  }

  /**
   * Проверяет, раскрыта ли строка
   */
  isExpanded(rowId) {
    return this.expandedRowId === rowId;
  }

  /**
   * Сворачивает все раскрытые строки
   */
  collapseAll() {
    if (this.expandedRowId !== null) {
      const button = this.findButtonForRow(this.expandedRowId);
      this.collapse(this.expandedRowId, button);
    }
  }

  /**
   * Получает детальные строки для родительской строки
   */
  getDetailRows(parentRowId) {
    return this.detailRowsMap.get(parentRowId) || [];
  }
}