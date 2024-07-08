import flatpickr from "flatpickr";
import { Russian } from "flatpickr/dist/l10n/ru.js"
import { Select } from "../modules/mySelect.js";

export const createCalendar = (selector, options = {}) => {
  let customSelect

  function handleClickMonthNav(customSelect, instance) {
    customSelect.setValue(instance.currentMonth)
  }

  const defaultOptions = {
    locale: Russian,
    onReady: (selectedDates, dateStr, instance) => {
      const selectM = instance.calendarContainer.querySelector('.flatpickr-monthDropdown-months')
      selectM.classList.add('init-custom-select')
      selectM.setAttribute('name', 'flatpickr-month')
      selectM.setAttribute('data-select-min-width', 'false')
      selectM.setAttribute('data-special-select', `${selector}-select-flatpickr`)
      selectM.setAttribute('data-input-html', '<svg class="icon icon-arrow"><use xlink:href="./img/svg/sprite.svg#arrow"></use></svg>')

      customSelect = new Select({
        uniqueName: `${selector}-select-flatpickr`,
        activeIndex: instance.currentMonth,
        onChange: (e, select, optionValue) => instance.changeMonth(parseInt(optionValue), false)
      })
    },
    onMonthChange: (selectedDates, dateStr, instance) => handleClickMonthNav(customSelect, instance),
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return flatpickr(selector, mergedOptions);
};