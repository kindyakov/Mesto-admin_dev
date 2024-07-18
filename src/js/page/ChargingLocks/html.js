import { objStr } from "../../utils/objStr.js"

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
  return `
  <div class="locks__card">
      <div class="locks__card_top">
        <span>Ячейка: №${data.room_id ? data.room_id : ''}</span>
      </div>
      <div class="locks__card_img">
        <img src="./img/lock.png" alt="Замок">
      </div>
      <div class="locks__card_bottom">
        <div>
          <b>${data.electric_quantity}%</b>
          <img src="./img/icons/${getBatteryImage(data.electric_quantity)}" alt="иконка">
        </div>
        <button class="table-button transparent" data-json="${objStr(data)}" data-modal="modal-confirm-open-room"><span>Открыть</span></button>
      </div>
    </div>`
}