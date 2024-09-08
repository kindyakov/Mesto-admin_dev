import tippy from "../../../configs/tippy.js";
import { declOfNum } from "../../../utils/declOfNum.js";
import { getFormattedDate } from "../../../utils/getFormattedDate.js";

function dataStr(data) {
  return JSON.stringify(data).replace(/\s+/g, '').replace(/"/g, '&quot;')
}

export function agreementHtml(data) {
  if (!data) return null;

  const innerContainer = document.createElement('div');
  innerContainer.classList.add('modal__block_grid-item');
  innerContainer.innerHTML = `
    <span class="item-num">${data.agrid ? '№' + data.agrid : ''}</span>
    <p class="item-info ${data.days_left ? 'hover-line' : ''}">${data.days_left
      ? +data.days_left > 0
        ? data.days_left + ` ${declOfNum(+data.days_left, ['день', 'дня', 'дней'])} до окончания`
        : Math.abs(+data.days_left) + ` ${declOfNum(Math.abs(+data.days_left), ['день', 'дня', 'дней'])} просрочен`
      : 'Не оплачен'}</p>
    <button class="item-more-detailed" agr-id="${data.agrid ? data.agrid : ''}" data-modal="modal-agreement"><span>Подробнее</span></button>
  `;

  const itemInfo = innerContainer.querySelector('.item-info');

  if (data.next_payment_date) {
    tippy(itemInfo, {
      trigger: 'mouseenter',
      placement: 'top',
      arrow: true,
      offset: [0, 0],
      content: `<span class="tippy-info-span tippy-info-date">${getFormattedDate(data.next_payment_date)}</span>`,
    });
  }

  return innerContainer;
}