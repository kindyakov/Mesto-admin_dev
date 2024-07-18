import tippy from "tippy.js"
import RangeSlider from "../RangeSlider/RangeSlider.js"

class BaseFilter {
  constructor(button, options = {}, defaultFilterValues) {
    if (!button) return;

    this.defaultOptions = {
      duration: 0,
      allowHTML: true,
      content: '<div>Пусто</div>',
      trigger: 'click',
      placement: 'bottom-start',
      interactive: true,
      appendTo: document.body,
    };

    this.defaultFilterValues = defaultFilterValues;
    this.filterParams = { ...this.defaultFilterValues };
    this.options = Object.assign({}, this.defaultOptions, options);

    this.onOpen = () => { };
    this.onClose = () => { };
    this.onInput = () => { };
    this.onApply = () => { };
    this.onClear = () => { };

    this.instanceTippy = tippy(button, {
      onTrigger: (example, event) => this.onOpen(example, event),
      onShow: () => { },
      onHide: (example) => this.onClose(example),
      ...this.options
    });

    this.button = button
    this.inputs = [];
    this.btnApply = [];
    this.btnClear = [];
    this.rangeFilters = [];
    this.rangeSlider = [];
    this.isSync = false;

    this.init(button);
  }

  init(button) {
    if (button.length) {
      for (let i = 0; i < button.length; i++) {
        this.inputs.push(...this.instanceTippy[i].popper.querySelectorAll('.input-filter'));
        this.btnApply.push(this.instanceTippy[i].popper.querySelector('.btn-filter-apply'));
        this.btnClear.push(this.instanceTippy[i].popper.querySelector('.btn-filter-clear'));
        this.rangeFilters.push(...this.instanceTippy[i].popper.querySelectorAll('.range-filter'));
      }
      this.isSync = true;
    } else {
      this.inputs = [...this.instanceTippy.popper.querySelectorAll('.input-filter')];
      this.btnApply = [this.instanceTippy.popper.querySelector('.btn-filter-apply')];
      this.btnClear = [this.instanceTippy.popper.querySelector('.btn-filter-clear')];
      this.rangeFilters = [...this.instanceTippy.popper.querySelectorAll('.range-filter')];
    }

    this.attachEvents();
  }

  attachEvents() {
    this.inputs.length && this.inputs.forEach(input => {
      const [name, type] = input.name.split('_');
      input.addEventListener('input', () => this.handleInput(input, [name, type]));
      input.addEventListener('keydown', (event) => this.handleArrowKeys(input, event, [name, type]));
    });

    this.rangeFilters.length && this.rangeFilters.forEach(slider => {
      const [vStart, vEnd] = slider.getAttribute('data-name').split(',');

      const range = new RangeSlider(slider, {
        start: [this.defaultFilterValues[vStart], this.defaultFilterValues[vEnd]],
        range: {
          'min': this.defaultFilterValues[vStart],
          'max': this.defaultFilterValues[vEnd]
        },
        step: 1
      });

      range.onSliderSlide = (values, i) => this.handleSliderSlide(values, i, range);
      this.rangeSlider.push(range);
    });

    this.btnApply.length && this.btnApply.forEach(btn => btn.addEventListener('click', () => this.handleBtnApply()));
    this.btnClear.length && this.btnClear.forEach(btn => btn.addEventListener('click', () => this.handleBtnClear()));
  }

  handleInput(input, [name, type]) {
    this.validateAndCorrect(input, [name, type]);
    this.onInput();
  }

  handleArrowKeys(input, event, [name, type]) {
    const step = +input.getAttribute('data-step');
    const fixed = step >= 1 ? 0 : 1;
    const maxValue = this.defaultFilterValues[`${name}_end`];
    let value = parseFloat(input.value) || 0;

    if (event.key === 'ArrowUp' && value < maxValue) {
      value += step;
      input.value = value.toFixed(fixed);
      event.preventDefault();
    } else if (event.key === 'ArrowDown' && value > 0) {
      value -= step;
      input.value = value.toFixed(fixed);
      event.preventDefault();
    }

    this.validateAndCorrect(input, [name, type]);
  }

  handleBtnApply() {
    if (this.isSync) {
      this.forInstance(inst => inst.hide());
    } else {
      this.instanceTippy.hide();
    }
    this.onApply(this.filterParams);
  }

  handleBtnClear() {
    this.inputs.length && this.inputs.forEach(input => {
      input.value = this.defaultFilterValues[input.name];
      this.changeParams(input, input.value);
    });

    this.rangeSlider.length && this.rangeSlider.forEach(range => {
      range.slider.set(range.options.start);
    });

    this.onClear(this.filterParams);
  }

  handleSliderSlide(values, i, range) {
    const value = parseInt(values[i]);
    const names = range.sliderElement.getAttribute('data-name').split(',');
    const input = range.sliderElement.parentElement.querySelector(`[name="${names[i]}"]`);
    input.value = value;
    this.isSync && this.syncFilters(input);
    this.changeParams(input, input.value);
  }

  updateSliderSlide(input, isSync = false) {
    const wrap = input.closest('.filter__block');
    const range = wrap.querySelector('.range-filter');

    if (range && this.rangeSlider.length) {
      const currentRanges = this.rangeSlider.filter(_range => _range.sliderElement.dataset.name === range.dataset.name);
      const [name, type] = input.name.split('_');
      const iVal = type === 'start' ? 0 : 1;

      currentRanges.length && currentRanges.forEach(_range => {
        if (_range.sliderElement == range && isSync) return;
        const values = _range.slider.get();
        values[iVal] = input.value;
        _range.slider.set(values);
      });
    }
  }

  fractionalNumber(input, maxValue) {
    let value = input.value;
    const regex = /^\d+(\.\d)?$/; // Регулярное выражение для проверки дробного числа с одной цифрой после запятой

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

    return value;
  }

  validateAndCorrect(input, [name, type]) {
    const maxValue = this.defaultFilterValues[`${name}_end`];
    let value = this.fractionalNumber(input, maxValue);

    if (type === 'start') {
      const endInput = Array.from(this.inputs).find(i => i.name === `${name}_end`);
      if (endInput && parseFloat(value) > parseFloat(endInput.value)) {
        input.value = endInput.value;
      }
    } else if (type === 'end') {
      const startInput = Array.from(this.inputs).find(i => i.name === `${name}_start`);
      if (startInput && parseFloat(value) < parseFloat(startInput.value)) {
        input.value = startInput.value;
      }
    }

    this.isSync && this.syncFilters(input);
    this.changeParams(input, input.value);
    this.updateSliderSlide(input);
  }

  changeParams(input, value) {
    this.filterParams[input.name] = +value;
  }

  forInstance(func = () => { }) {
    for (let i = 0; i < this.button.length; i++) {
      func(this.instanceTippy[i]);
    }
  }

  syncFilters(input) {
    const cloneInputs = this.inputs.filter(_input => _input !== input && _input.name === input.name);

    cloneInputs.length && cloneInputs.forEach(_input => {
      _input.value = input.value;
    });

    this.updateSliderSlide(input, true);
  }
}

export default BaseFilter