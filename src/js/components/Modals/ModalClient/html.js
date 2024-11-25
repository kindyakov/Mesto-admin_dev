import tippy from "../../../configs/tippy.js";
import { declOfNum } from "../../../utils/declOfNum.js";
import { getFormattedDate } from "../../../utils/getFormattedDate.js";

function dataStr(data) {
  return JSON.stringify(data).replace(/\s+/g, '').replace(/"/g, '&quot;')
}

/**
 * Форматирует количество дней с правильным склонением
 * @param {number} days - количество дней
 * @param {boolean} isPastDue - просрочен ли договор
 * @returns {string}
 */
function formatDaysMessage(days, isPastDue) {
  const absoluteDays = Math.abs(days);
  const daysWord = declOfNum(absoluteDays, ['день', 'дня', 'дней']);

  return isPastDue
    ? `${absoluteDays} ${daysWord} просрочен`
    : `${absoluteDays} ${daysWord} до окончания`;
}

/**
 * Возвращает статус договора
 * @param {Object} data - данные договора
 * @returns {string}
 */
function getAgreementStatus(data) {
  if (data.agrenddate) {
    return 'Договор закрыт';
  }

  if (!data.days_left) {
    return 'Не оплачен';
  }

  const isPastDue = +data.days_left <= 0;
  return formatDaysMessage(+data.days_left, isPastDue);
}

/**
 * Формирует номер договора
 * @param {string} agrid - номер договора
 * @returns {string}
 */
function formatAgreementNumber(agrid) {
  return agrid ? `№${agrid}` : '';
}

export function agreementHtml(data) {
  if (!data) return null;

  const innerContainer = document.createElement('div');
  innerContainer.classList.add('modal__block_grid-item');
  innerContainer.innerHTML = `
    <span class="item-num">${formatAgreementNumber(data.agrid)}</span>
    <p class="item-info ${data.days_left ? 'hover-line' : ''}">${getAgreementStatus(data)}</p>
    <button class="item-more-detailed" 
      agr-id="${data.agrid || ''}" 
      data-modal="modal-agreement">
      <span>Подробнее</span>
    </button>
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