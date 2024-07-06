import Table from '../Table.js';
import { formattingPrice, formatPhoneNumber } from '../../../utils/formattingPrice.js';
import { declOfNum } from '../../../utils/declOfNum.js';


function addPrefixToNumbers(input) {
  // Разделяем строку по запятой и удаляем лишние пробелы
  let numbers = input.split(',').map(num => num.trim());
  // Добавляем префикс "№" к каждому числу
  let prefixedNumbers = numbers.map(num => `№${num}`);
  // Объединяем обратно в строку через запятую
  return prefixedNumbers.join(', ');
}

class ClientsTable extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        { headerCheckboxSelection: true, checkboxSelection: true, width: 50, resizable: false, sortable: false },
        {
          headerName: 'ФИО', field: 'fullname', flex: 1.5, editable: params => this.isCellEditable(params),
          cellRenderer: params => {
            const p = document.createElement('p')
            p.classList.add('table-p')
            p.innerHTML = `
            <svg class='icon icon-profile'>
              <use xlink:href='img/svg/sprite.svg#profile'></use>
            </svg>
            <span>${params.value ? `${params.value} ${declOfNum(Math.abs(params.value), ['День', 'Дня', 'Дней'])}` : 'Нет'}</span>`
            return p
          }
        },
        { headerName: 'Телефон', field: 'username', flex: 0.8, editable: params => this.isCellEditable(params), valueFormatter: params => formatPhoneNumber(params.value) },
        { headerName: 'Почта', field: 'email', flex: 1.2, sortable: false, editable: params => this.isCellEditable(params) },
        { headerName: 'Ячейки', field: 'rooms', flex: 0.5, sortable: false, valueFormatter: params => params.value ? addPrefixToNumbers(params.value) : 'нет' },
        {
          headerName: 'Платеж в мес.', field: 'month_payment', flex: 0.5,
          cellRenderer: params => {
            const span = document.createElement('span')
            span.classList.add('table-span-price')
            span.innerHTML = params.value ? formattingPrice(params.value) : 'нет'
            return span
          }
        },
        {
          headerName: 'До платежа', field: 'days_left', flex: 0.5,
          cellRenderer: params => {
            const p = document.createElement('p')
            p.classList.add('table-p')
            p.innerHTML = `
            <svg class='icon icon-calendar'>
              <use xlink:href='img/svg/sprite.svg#calendar'></use>
            </svg>
            <span>${params.value ? `${params.value} ${declOfNum(Math.abs(params.value), ['День', 'Дня', 'Дней'])}` : 'Нет'}</span>`
            return p
          }
        },
        {
          headerName: 'Действия', field: 'actions', flex: 0.4,
          cellRenderer: params => this.actionCellRenderer(params), resizable: false, sortable: false
        }
      ],
      rowSelection: 'multiple', // Включение множественного выбора строк
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);
    super(selector, mergedOptions, params); // Вызов конструктора суперкласса

    // Убедитесь, что методы привязаны к текущему экземпляру класса
    this.isCellEditable = this.isCellEditable.bind(this);
    this.actionCellRenderer = this.actionCellRenderer.bind(this);
    this.enableEditing = this.enableEditing.bind(this);
  }

  // Метод для проверки условия редактирования
  isCellEditable(params) {
    // Здесь добавьте условие, при котором редактирование разрешено
    // Например, разрешить редактирование только если значение в поле 'editableField' равно true
    return params.data.editableField === true;
  }

  actionCellRenderer(params) {
    const button = document.createElement('button');
    button.classList.add('button-table-actions');
    button.innerHTML = `<span></span><span></span><span></span><svg class='icon icon-check'>
  <use xlink:href='img/svg/sprite.svg#check'></use>
</svg>`;
    button.addEventListener('click', () => {
      this.enableEditing(params.node)
      button.classList.toggle('_edit')
    })
    return button;
  }

  enableEditing(node) {
    // Установить editableField в true для разрешения редактирования
    node.data.editableField = true

    // Обновить редактируемые поля
    this.gridApi.refreshCells({ rowNodes: [node], columns: ['fullname', 'username', 'email'], force: true });
  }

  render(data) {
    const { clients, cnt_pages, page } = data;
    this.setPage(page, cnt_pages)
    this.gridApi.setGridOption('rowData', clients)
  }
}

export default ClientsTable

