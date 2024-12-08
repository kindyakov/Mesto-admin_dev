import tippy from '../../../configs/tippy.js';
import { createElement } from '../../../settings/createElement.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';
import { declOfNum } from '../../../utils/declOfNum.js';

export function createDaysLeftElement(params) {
  const p = createElement('p', {
    classes: ['table-p', 'days-left-p'],
    content: `
    <!-- <svg class='icon icon-calendar' style="${+params.value <= 0 ? 'fill: red;' : ''}">
      <use xlink:href='img/svg/sprite.svg#calendar'></use>
    </svg> -->
    <span style="${+params.value <= 0 ? 'color: red;' : ''}">${params.value ? `${params.value} ${declOfNum(Math.abs(params.value), ['День', 'Дня', 'Дней'])}` : '0 дней'}</span>`
  })

  // if (params.value && params.value >= 0) {
  const date = new Date();
  date.setDate(date.getDate() + params.value);

  tippy(p, {
    trigger: 'mouseenter',
    placement: 'top',
    arrow: true,
    interactive: false,
    content: `<span class="tippy-info-span tippy-info-rooms-id">${dateFormatter(date)}</span>`,
  })
  // }

  // if (params.value && params.value >= 0 && params.value <= 5) {
  // p.classList.add('_payments-soon')
  //   tippy(p, {
  //     trigger: 'mouseenter',
  //     placement: 'bottom-end',
  //     content: `<div class="tippy-contact"><p>Связались с клиентом?</p><button class="yes"><span>Да</span></button><button><span>Нет</span></button></div>`
  //   })
  // }

  return p
}
