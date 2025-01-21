import { formatPhoneNumber, formattingPrice } from '../../utils/formattingPrice.js';
import { dateFormatter } from '../../settings/dateFormatter.js';
import { dataStr } from '../../utils/dataStr.js';

function typeRoom({ rented, rentenddate, next_payment_date }) {
	const text = {
		0: '<span class="text">Свободно</span>',
		0.25: '<span class="text">Гостевые</span>',
		0.4: '<span class="text">Не оплачено</span>',
		0.5: '<span class="text">Забронировано</span>',
		0.75: `<span class="text">Выезд: ${rentenddate ? dateFormatter(rentenddate) : ''}</span>`,
		1: `<span class="text">Занято</span><span class="text">Оплачено по: ${next_payment_date ? dateFormatter(next_payment_date) : ''}</span>`
	};

	return text[rented] ? text[rented] : '';
}

// 0 Свободные
// 0.4 Неоплаченные
// 0.25 Гостевые
// 0.5 Забронированные
// 1 Занятые
// 0.75 Освобождающиеся
// 0.95 Дебиторы
// -1 Все

function buttonsBlockUnlock(data) {
	let obj = { agrid: data.agrid, room_id: data.room_id, blocked: data.blocked ? 0 : 1 };
	return `<button class="room__button button" data-modal="modal-confirm-lock-unlock" data-json="${dataStr(obj)}" data-blocked="${data.blocked}"></button>`;
}

function buttonsRoom(data) {
	const buttons = {
		0: `<button class="room__button button" data-json="${dataStr(data)}" data-modal="modal-add-client"><span>Оформить клиенту</span></button>`,
		0.25: `<button class="room__button button" data-json="${dataStr(data)}" data-modal="modal-confirm-cancel-guest-access"><span>Отменить доступ</span></button>`,
		0.45: ``,
		0.4: `<button class="room__button button" data-modal="modal-confirm-cancel-payment"><span>Отменить оплату</span></button>`,
		0.5: `<button class="room__button button" data-modal="modal-passport" user-id="${data.user_id}"><span>Подтвердить клиента</span></button>`,
		0.75: `<button class="room__button button ${data.leave_approved ? '_confirmed' : ''}" data-modal="modal-confirmation-departure" room-id="${data.room_id}" agr-id="${data.agrid}">
            <span>Подтвердить выезд</span>
            <span>Выезд подтвержден</span>
          </button>
          ${buttonsBlockUnlock(data)}`,
		0.95: buttonsBlockUnlock(data),
		1: buttonsBlockUnlock(data)
	};

	return buttons[data.rented] ? buttons[data.rented] : '';
}

export function roomHtml(data) {
	return `
  <div class="warehouse__body_room room">
            <div class="room__top">
              <span>Ячейка: №${data.room_name || ''}</span>
              ${data.remove ? `<button class="room__remove btn-remove-room" data-room-id="${data.room_name || ''} "></button>` : ''}
            </div >
            <div class="room__content">
              <div class="room__content_prices">
                <span class="price">${data.price ? formattingPrice(data.price) + ' / мес.' : ''}</span>
                ${typeRoom(data)}
              </div>
              <div class="room__content_sizes">
                <p>
                  <b>${data.volume ? data.volume + ' м<sup>3</sup>' : ''}</b>
                  <b style="margin-left: 10px;">${data.area ? data.area + ' м<sup>2</sup>' : ''}</b>
                </p>
                <span>${data.dimensions ? data.dimensions : ''} — ${data.floor ? data.floor + ' этаж' : ''}</span>
              </div>
              ${
								data.rented == 0
									? ''
									: `
                <div class="room__content_info">
                  ${
										data.fullname
											? `
                  <p data-modal="modal-client" user-id="${data.user_id}" style="cursor: pointer;">
                    <svg class='icon icon-user'>
                      <use xlink:href='img/svg/sprite.svg#user'></use>
                    </svg>
                    <span>${data.fullname}</span>
                  </p>`
											: ``
									}
                  ${
										data.username
											? `
                  <p>
                    <svg class='icon icon-phone'>
                      <use xlink:href='img/svg/sprite.svg#phone'></use>
                    </svg>
                    <span>${formatPhoneNumber(data.username)}</span>
                    ${data.rented == 0.4 ? `<button data-json="${dataStr(data)}" class="button-text blue"><span>Позвонить</span></button>` : ''}
                  </p>`
											: ''
									}
                </div>
              `
							}  
            </div>
            <div class="room__bottom">
              ${buttonsRoom(data)}
              ${
								+data.rented === 0.75
									? `<button class="room__button button transparent" data-modal="modal-complete-rent" agr-id="${data.agrid || ''}" room-id="${data.room_id || ''}">
          <span>Ускорить</span>
        </button>`
									: `<button class="room__button button transparent" data-json="${dataStr(data)}" data-modal="modal-confirm-open-room">
          <span>Открыть ячейку</span>
        </button>`
							}
            </div>
          </div>`;
}

export function rowHtml(data) {
	return `
    <div class="warehouse__confirmation_row">
                <p class="name">${data.fullname ? data.fullname : ''}</p>
                <span class="span">Выезд:<b>${data.rentenddate ? dateFormatter(data.rentenddate) : ''}</b></span>
                <button class="button table-button ${data.leave_approved ? '_confirmed' : ''}" data-modal="modal-confirmation-departure" room-id="${data.room_id}" agr-id="${data.agrid}">
                  <span>Подтвердить</span>
                  <span>Подтвержден</span>
                </button>
              </div>`;
}

export function row2Html(data) {
	return `
    <div class="warehouse__confirmation_row">
                <p class="name">${data.familyname} ${data.firstname} ${data.patronymic}</p>
                <button class="button table-button" data-modal="modal-passport" user-id="${data.user_id}"><span>Подтвердить</span></button>
              </div>`;
}
