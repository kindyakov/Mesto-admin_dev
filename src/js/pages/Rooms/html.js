import { formatPhoneNumber, formattingPrice } from "../../utils/formattingPrice.js";
import { dateFormatter } from "../../settings/dateFormatter.js";

function typeRoom({ rented, rentenddate }) {
  const text = {
    0: 'Свободно',
    0.25: 'Гостевые',
    0.4: 'Не оплачено',
    0.5: 'Забронировано',
    0.75: `Выезд: ${rentenddate ? dateFormatter(rentenddate) : ''}`,
    1: 'Занято',
  }

  return text[rented] ? text[rented] : ''
}

function dataStr(data) {
  return JSON.stringify(data).replace(/\s+/g, '').replace(/"/g, '&quot;')
}

function buttonsRoom(data) {
  const buttons = {
    0: `<button class="room__button button" data-json="${dataStr(data)}" data-modal="modal-add-client"><span>Оформить клиенту</span></button>`,
    0.25: `<button class="room__button button" data-json="${dataStr(data)}" data-modal=""><span>Отменить доступ</span></button>`,
    0.45: ``,
    0.4: `<button class="room__button button" data-json="${dataStr(data)}" data-modal=""><span>Отменить оплату</span></button>`,
    0.5: `<button class="room__button button" data-json="${dataStr(data)}" data-modal="modal-confirmation-client"><span>Подтвердить клиента</span></button>`,
    0.75: `<button class="room__button button" data-json="${dataStr(data)}" data-modal="modal-confirmation-departure"><span>Подтвердить выезд</span></button>`,
    1: ``,
  }

  return buttons[data.rented] ? buttons[data.rented] : ''
}

export function roomHtml(data) {
  return `
  <div class="warehouse__body_room room">
            <div class="room__top">
              <span>Ячейка: №${data.room_id ? data.room_id : ''}</span>
              ${data.remove ? `<button class="room__remove btn-remove-room" data-room-id="${data.room_id}"></button>` : ''}
            </div>
            <div class="room__content">
              <div class="room__content_prices">
                <span class="price">${data.price ? formattingPrice(data.price) + ' / мес.' : ''}</span>
                <span class="text">${typeRoom(data)}</span>
              </div>
              <div class="room__content_sizes">
                <b>${data.volume ? data.volume + ' м<sup>3</sup>' : ''}</b>
                <span>${data.dimensions ? data.dimensions : ''} — ${data.floor ? data.floor + ' этаж' : ''}</span>
              </div>
              ${data.rented == 0 ? '' : `
                <div class="room__content_info">
                  ${data.fullname ? `
                  <p data-modal="modal-client" user-id="${data.user_id}" style="cursor: pointer;">
                    <svg class='icon icon-user'>
                      <use xlink:href='img/svg/sprite.svg#user'></use>
                    </svg>
                    <span>${data.fullname}</span>
                  </p>` : ``}
                  ${data.username ? `
                  <p>
                    <svg class='icon icon-phone'>
                      <use xlink:href='img/svg/sprite.svg#phone'></use>
                    </svg>
                    <span>${formatPhoneNumber(data.username)}</span>
                    ${data.rented == 0.4 ? `<button data-json="${dataStr(data)}" class="button-text blue"><span>Позвонить</span></button>` : ''}
                  </p>` : ''}
                </div>
              `}  
            </div>
            <div class="room__bottom">
              ${buttonsRoom(data)}
              ${+data.rented === 0.75 ?
      `<button class="room__button button transparent" data-json="${dataStr(data)}" data-modal=""><span>Ускорить</span></button>` : `<button class="room__button button transparent" data-json="${dataStr(data)}" data-modal="modal-confirm-open-room"><span>Открыть</span></button>`}
            </div>
          </div>`
}

export function rowHtml(data) {
  return `
  <div class="warehouse__confirmation_row">
                <p class="name">${data.fullname ? data.fullname : ''}</p>
                <span class="span">Выезд:<b>${data.rentenddate ? dateFormatter(data.rentenddate) : ''}</b></span>
                <button class="button table-button" data-modal="modal-confirmation-departure" data-json="${dataStr(data)}"><span>Подтвердить</span></button>
              </div>`
}

export function row2Html(data) {
  return `
  <div class="warehouse__confirmation_row">
                <p class="name">${data.familyname} ${data.firstname} ${data.patronymic}</p>
                <button class="button table-button" data-modal="modal-confirmation-client" data-json="${dataStr(data)}"><span>Подтвердить</span></button>
              </div>`
}