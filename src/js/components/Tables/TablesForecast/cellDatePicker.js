import datePicker from '../../../configs/datepicker.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';

export function cellDatePicker(input, { params, prefixClass = 'air', hasDay = true }) {
  const customClassDatePicker = `${prefixClass}-${params.colDef.field}-${params.node.rowIndex}`
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  let startDate = new Date(params.value)

  input.dataset.value = dateFormatter(startDate, hasDay ? 'yyyy-MM-dd' : 'yyyy-MM')

  const datepicker = datePicker(input, {
    classes: customClassDatePicker,
    view: hasDay ? 'days' : 'months',
    minView: hasDay ? 'days' : 'months',
    dateFormat: hasDay ? 'dd.MM.yyyy' : 'yyyy, MMMM',
    autoClose: true,
    startDate, selectedDates: [startDate],
    position({ $datepicker, $target, $pointer }) {
      let coords = $target.getBoundingClientRect()
      let top = coords.y + coords.height
      let left = coords.x

      $datepicker.style.left = isMobile ? '50%' : `${left}px`;
      $datepicker.style.top = isMobile ? '50%' : `${top}px`;
      $datepicker.style.transform = isMobile ? 'translate(-50%, -50%)' : 'translate(0, 0)'
      $pointer.style.display = 'none';
    },
    onShow: onShow,
    onSelect({ date, formattedDate, datepicker }) {
      input.dataset.value = dateFormatter(date, hasDay ? 'yyyy-MM-dd' : 'yyyy-MM')
    }
  })

  function onShow() {
    const { $el, $datepicker } = datepicker
    const overlay = $datepicker.parentNode.querySelector('.air-datepicker-overlay')

    if ($el.classList.contains('not-edit')) {
      datepicker.hide()
      setTimeout(() => overlay?.classList.remove('-active-'))
    }
  }

  return datepicker
}