import { declOfNum } from "../../../utils/declOfNum.js"
import { formatPhoneNumber, formattingPrice } from "../../../utils/formattingPrice.js"
import { getFormattedDate } from "../../../utils/getFormattedDate.js"

const actions = {
  'INPUT': {
    'date': (el, value) => el.value = getFormattedDate(value),
    'area': (el, value) => el.value = value + ' м²',
    'day': (el, value) => el.value = !!value ? `${value} ${declOfNum(Math.abs(+value), ['день', 'дня', 'дней'])}` : '',
    'price': (el, value) => el.value = formattingPrice(value),
    'username': (el, value) => el.value = formatPhoneNumber(value),
    'num': (el, value) => el.value = "№" + value,
    'default': (el, value) => el.value = value
  },
  'IMG': (el, value) => el.src = value,
  'SELECT': (el, value) => el.value = value,
  'wp-status': (el, value) => {
    el.classList.remove('confirmed', 'not-confirmed')
    el.classList.add(`${value ? 'confirmed' : 'not-confirmed'}`)
  },
  'default': (el, value) => el.textContent = value
}

export function renderForm(el, data) {
  const [name, type] = el.getAttribute('data-render').split(',')
  const value = data[name] ? data[name] : ''

  if (el.tagName === 'INPUT') {
    (actions.INPUT[type] || actions.INPUT['default'])(el, value)
  } else if (el.tagName in actions) {
    actions[el.tagName](el, value)
  } else if (el.classList.contains('wp-status')) {
    actions['wp-status'](el, value)
  } else {
    actions['default'](el, value)
  }
}