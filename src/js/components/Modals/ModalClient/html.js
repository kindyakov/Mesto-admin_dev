import tippy from "tippy.js";
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
    <p class="item-info">${data.days_left ? data.days_left + ` ${declOfNum(+data.days_left, ['день', 'дня', 'дней'])} до окончания` : ''}</p>
    <button class="item-more-detailed" data-agr-id="${data.agrid ? data.agrid : ''}" data-modal="modal-agreement" data-json="${dataStr(data)}"><span>Подробнее</span></button>
  `;

  const itemInfo = innerContainer.querySelector('.item-info');

  if (data.next_payment_date) {
    tippy(itemInfo, {
      allowHTML: true,
      arrow: true,
      duration: 0,
      content: `<span class="tippy-info-span tippy-info-date">${getFormattedDate(data.next_payment_date)}</span>`,
    });
  }

  return innerContainer;
}