{
  columnDefs: [
    { headerCheckboxSelection: true, checkboxSelection: true, width: 50, resizable: false, sortable: false, },
    {
      headerName: 'Дата платежа', field: 'payment_date', flex: 0.5,
      cellRenderer: params => cellRendererInput(params, getFormattedDate, 'calendar')
    },
    {
      headerName: 'Сумма', field: 'amount', flex: 0.5,
      cellRenderer: params => {
        const span = document.createElement('span')
        span.classList.add('table-span-price')
        span.innerHTML = params.value ? formattingPrice(params.value) : 'нет'
        return cellRendererInput(params, undefined, null, span)
      }
    },
    {
      headerName: 'ФИО', field: 'fullname', flex: 1,
      cellRenderer: params => cellRendererInput(params, undefined, 'profile')
    },
    {
      headerName: 'Договор', field: 'agrid', flex: 0.5,
      cellRenderer: params => {
        const span = document.createElement('span')
        span.classList.add('table-span-agrid')
        span.textContent = params.value ? addPrefixToNumbers(params.value) : 'нет'
        return cellRendererInput(params, undefined, null, span)
      }
    },
    {
      headerName: 'Вид поступления', field: 'type', flex: 0.5,
    },
    {
      headerName: 'Физ./Юр.', field: 'user_type', flex: 0.5,
      valueFormatter: params => params.value === 'f' ? 'Физ. лицо' : 'Юр. лицо'
    },
    {
      headerName: 'Действия', field: 'actions', flex: 0.3, resizable: false, sortable: false,
      cellRenderer: params => this.actionCellRenderer(params),
    }
  ]
}