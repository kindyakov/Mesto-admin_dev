import tippy from "tippy.js"
import { filterHtml } from "./html.js"

const defaultOptions = {
  duration: 0,
  allowHTML: true,
  content: filterHtml(),
  trigger: 'click',
  placement: 'bottom-start',
  interactive: true,
  appendTo: document.body,
}

const defaultMethods = {
  onOpen: () => { },
  onClose: () => { },
  onInput: () => { },
  onApply: () => { },
  onClear: () => { },
}

const defaultFilterValues = {
  area_start: 0,
  area_end: 10,
  price_start: 0,
  price_end: 30000,
  length_start: 0,
  length_end: 4,
  width_start: 0,
  width_end: 3,
  height_start: 0,
  height_end: 4,
}

const filterParams = { ...defaultFilterValues }

export function FilterRooms(button, options = {}, methods = {}) {
  if (!button) return

  const mergerOptions = Object.assign({}, defaultOptions, options)
  const mergerMethods = Object.assign({}, defaultMethods, methods)

  let instance = mergerMethods

  const instanceTippy = tippy(button, {
    onTrigger(example, event) {
      instance.onOpen(example, event)
    },
    onShow(instance) {
    },
    onHide(example) {
      instance.onClose(example)
    },
    ...mergerOptions
  });

  instance = { ...instance, ...instanceTippy }

  const inputs = instance.popper.querySelectorAll('.input-filter-rooms')
  const btnApply = instance.popper.querySelector('.btn-filter-apply')
  const btnClear = instance.popper.querySelector('.btn-filter-clear')

  inputs.length && inputs.forEach(input => {
    const [name, type] = input.name.split('_')

    input.addEventListener('input', () => handleInput(input, [name, type]))
    input.addEventListener('keydown', (event) => handleArrowKeys(input, event, [name, type]))
  })

  btnApply.addEventListener('click', handleBtnApply)
  btnClear.addEventListener('click', handleBtnClear)

  function handleInput(input, [name, type]) {
    validateAndCorrect(input, [name, type])
    instance.onInput()
  }

  function handleArrowKeys(input, event, [name, type]) {
    const step = name === 'price' ? 1 : 0.1
    const fixed = name === 'price' ? 0 : 1
    const maxValue = defaultFilterValues[`${name}_end`]
    let value = parseFloat(input.value) || 0

    if (event.key === 'ArrowUp' && value < maxValue) {
      value += step;
      input.value = value.toFixed(fixed)
      event.preventDefault();
    } else if (event.key === 'ArrowDown' && value > 0) {
      value -= step;
      input.value = value.toFixed(fixed)
      event.preventDefault();
    }

    validateAndCorrect(input, [name, type])
  }

  function handleBtnApply() {
    instance.hide()
    instance.onApply(filterParams)
  }

  function handleBtnClear() {
    inputs.length && inputs.forEach(input => {
      input.value = defaultFilterValues[input.name]
      changeParams(input, input.value)
    })
    instance.onClear(filterParams)
  }

  function fractionalNumber(input, maxValue) {
    let value = input.value;
    const regex = /^\d+(\.\d{0,1})?$/; // Регулярное выражение для проверки дробного числа с одной цифрой после запятой

    // Если значение не соответствует требованиям, корректируем его
    if (!regex.test(value)) {
      value = parseFloat(value).toFixed(1);
      input.value = isNaN(value) ? '' : value;
    }

    // Проверка на maxValue
    if (parseFloat(value) > maxValue) {
      value = maxValue;
      input.value = value;
    }

    return value
  }

  function validateAndCorrect(input, [name, type]) {
    const maxValue = defaultFilterValues[`${name}_end`];
    let value = fractionalNumber(input, maxValue);

    if (type === 'start') {
      const endInput = Array.from(inputs).find(i => i.name === `${name}_end`);
      if (endInput && parseFloat(value) > parseFloat(endInput.value)) {
        input.value = endInput.value;
      }
    } else if (type === 'end') {
      const startInput = Array.from(inputs).find(i => i.name === `${name}_start`);
      if (startInput && parseFloat(value) < parseFloat(startInput.value)) {
        input.value = startInput.value;
      }
    }

    changeParams(input, input.value)
  }

  function changeParams(input, value) {
    filterParams[input.name] = +value
  }

  instance.changeParams = changeParams

  return instance
}