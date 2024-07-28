import { getFormattedDate } from "../../utils/getFormattedDate.js"
import { dateFormatter } from "../../settings/dateFormatter.js"

function getTimeNow() {
  const date = new Date()
  const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
  const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  return `${hours}:${minutes}`
}

export function rowHtml(data = false) {
  function dataStr(data) {
    return JSON.stringify(data).replace(/\s+/g, '').replace(/"/g, '&quot;')
  }

  return `
  <div class="working-hours__row" data-id="${data.id ? data.id : ''}">
      <span class="working-hours__date">${data.date ? getFormattedDate(data.date) : ''}</span>
      <div class="working-hours__item">
        <b class="working-hours__time time-now">${getTimeNow()}</b>
        <span class="working-hours__text date-now">${dateFormatter(new Date(), "dd, MMMM yyyy 'г.'")}</span>
      </div>
      <div class="working-hours__item">
        ${data?.time_start ? `
          <b class="working-hours__time time-start">${data.time_start}</b>
          <span class="working-hours__text">Вы начали рабочий день</span>` : ''}
      </div>
      <div class="working-hours__item">
        ${data?.time_end ? `
          <b class="working-hours__time time-end">${data?.time_end}</b>
          <span class="working-hours__text">Вы завершили рабочий день</span>` : ''}
      </div>
      <div class="working-hours__item">
        ${data ? `
        ${data.time_end ? '' : `<button class="button btn-end-working-day" data-json="${dataStr({ ...data, start_or_end: 'end' })}" data-modal="modal-download-photo-wh"><span>Завершить рабочий день</span></button>`}
        ${data.start_photo_link ?
        `<button class="button" data-json="${dataStr({ ...data, showPhoto: data.start_photo_link })}" data-modal="modal-show-photo-wh"><span>Фото начало</span></button>` : ''}
      ${data.end_photo_link ?
        `<button class="button" data-json="${dataStr({ ...data, showPhoto: data.end_photo_link })}" data-modal="modal-show-photo-wh"><span>Фото завершения</span></button>` : ''}
                ` : `<button class="button btn-start-working-day" data-json="${dataStr({ ...data, start_or_end: 'start' })}" data-modal="modal-download-photo-wh"><span>Начать рабочий день</span></button>`}
      </div>
    </div>`
}