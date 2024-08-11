import flatpickr from "flatpickr";
import { Russian } from "flatpickr/dist/l10n/ru.js"
import { Select } from "../modules/mySelect.js";

const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',]

export const createCalendar = (input, options = {}) => {
  if (!input) return
  const methods = {
    onChange: () => { }
  }

  let customSelect, uniqueId = Math.random()

  function handleClickMonthNav(customSelect, instance) {
    customSelect.setValue(instance.currentMonth);
  }

  const defaultOptions = {
    locale: Russian,
    disableMobile: true,
    onReady: (selectedDates, dateStr, instance) => {
      if (!instance.calendarContainer) return

      document.addEventListener('click', (event) => {
        if (
          instance.isOpen &&
          !instance.calendarContainer.contains(event.target) &&
          !instance.input.contains(event.target)
        ) {
          instance.close();
        }
      });

      const selectM = instance.calendarContainer.querySelector('.flatpickr-monthDropdown-months');
      selectM.classList.add('init-custom-select');
      selectM.setAttribute('name', 'flatpickr-month');
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
        selectMinWidth: 130,
        onChange: (e, select, optionValue) => instance.changeMonth(parseInt(optionValue), false)
      });
    },
    onMonthChange: (selectedDates, dateStr, instance) => handleClickMonthNav(customSelect, instance),
    onChange: (selectedDates, dateStr, instance) => {
      methods.onChange(selectedDates, dateStr, instance)
    },
    onOpen: [
      function (selectedDates, dateStr, instance) {
        if (instance.config.appendTo?.classList.contains('wp-input')) {
          setTimeout(() => {
            instance.calendarContainer.style.cssText = 'top: calc(100% + 5px); left: 0; right: auto;'
          })
        }
      },
    ],
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