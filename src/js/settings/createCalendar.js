import flatpickr from "flatpickr";
import { Russian } from "flatpickr/dist/l10n/ru.js"
import { Select } from "../modules/mySelect.js";

const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'октябрь', 'Ноябрь', 'Декабрь',]

export const createCalendar = (input, options = {}) => {
  if (!input) return
  const methods = {
    onChange: () => {}
  }

  let customSelect, uniqueId = Math.random()

  function handleClickMonthNav(customSelect, instance) {
    customSelect.setValue(instance.currentMonth);
  }

  const defaultOptions = {
    locale: Russian,
    onReady: (selectedDates, dateStr, instance) => {
      const selectM = instance.calendarContainer.querySelector('.flatpickr-monthDropdown-months');
      selectM.classList.add('init-custom-select');
      selectM.setAttribute('name', 'flatpickr-month');
      selectM.setAttribute('data-select-min-width', 'false');
      selectM.setAttribute('data-special-select', `${uniqueId}-select-flatpickr`);
      selectM.setAttribute('data-input-html', '<svg class="icon icon-arrow"><use xlink:href="./img/svg/sprite.svg#arrow"></use></svg>');
      selectM.innerHTML = '';
      months.forEach((month, i) => {
        selectM.insertAdjacentHTML('beforeend', `<option class="flatpickr-monthDropdown-month" value="${i}" tabindex="-1">${month}</option>`);
      });

      customSelect = new Select({
        uniqueName: `${uniqueId}-select-flatpickr`,
        activeIndex: instance.currentMonth,
        maxHeightList: 279,
        onChange: (e, select, optionValue) => instance.changeMonth(parseInt(optionValue), false)
      });
    },
    onMonthChange: (selectedDates, dateStr, instance) => handleClickMonthNav(customSelect, instance),
    onChange: (selectedDates, dateStr, instance) => {
      methods.onChange(selectedDates, dateStr, instance)
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  let element;
  if (typeof input === 'string') {
    element = document.querySelector(input);
  } else if (input instanceof Element) {
    element = input;
  } else {
    throw new Error("Недопустимый ввод: должно быть, это строка выбора или элемент DOM");
  }

  return { methods, ...flatpickr(element, mergedOptions) }
};