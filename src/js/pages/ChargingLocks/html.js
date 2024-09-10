import { objStr } from "../../utils/objStr.js"
import { dateFormatter } from "../../settings/dateFormatter.js";

export function getBatteryImage(chargeLevel) {
  // if (typeof chargeLevel !== 'number' || chargeLevel < 0 || chargeLevel > 100) {
  //   throw new Error('Invalid charge level');
  // }

  if (chargeLevel > 80) {
    return 'BatteryFull.png';
  } else if (chargeLevel > 60) {
    return 'BatteryHigh.png';
  } else if (chargeLevel > 40) {
    return 'BatteryMedium.png';
  } else {
    return 'BatteryLow.png';
  }
}

export function cardHtml(data) {
  let updateDate = ''
  if (data.update_date) {
    const [date, time] = data.update_date.split(' ')
    updateDate = `${dateFormatter(date)} ${time}`
  }

  return `
  <div class="locks__card">
      <div class="locks__card_top">
        <span class="num">Ячейка: №${data.room_name || ''}</span>
        <span class="update-date">${updateDate}</span>
      </div>
      <div class="locks__card_img">
        <img src="./img/lock.png" alt="Замок">
      </div>
      <div class="locks__card_bottom">
        <div>
          <b>${data.electric_quantity ? data.electric_quantity + '%' : ''}</b>
          <img src="./img/icons/${getBatteryImage(data.electric_quantity)}" alt="иконка">
        </div>
        <button class="table-button transparent" data-json="${objStr(data)}" data-modal="modal-confirm-open-room"><span>Открыть</span></button>
      </div>
    </div>`
}