class RangeSlider {
	constructor(sliderElement, userOptions = {}) {
		if (!sliderElement) {
			throw new Error('Slider element is required.');
		}

		// Дефолтные настройки
		this.defaultOptions = {
			start: [20, 80],
			// connect: true,
			range: {
				'min': 0,
				'max': 100
			}
		};

		// Объединяем пользовательские настройки с дефолтными
		this.options = { ...this.defaultOptions, ...userOptions };

		this.sliderElement = sliderElement;

		// Инициализация слайдера
		this.slider = noUiSlider.create(this.sliderElement, this.options);

		this.onSliderUpdate = () => { }
		this.onSliderSlide = () => { }

		// Навешивание обработчиков событий
		this.sliderElement.noUiSlider.on('update', this._onSliderUpdate.bind(this));
		this.sliderElement.noUiSlider.on('slide', this._onSliderSlide.bind(this));
	}

	// Внутренний метод, который вызывает пользовательский метод, если он определен
	_onSliderUpdate(values, handle, unencoded, tap, positions, noUiSlider) {
		if (typeof this.onSliderUpdate === 'function') {
			this.onSliderUpdate({ values, handle, unencoded, tap, positions, noUiSlider });
		} else {
		}
	}

	// Внутренний метод, который вызывает пользовательский метод, если он определен
	_onSliderSlide(values, handle, unencoded, tap, positions, noUiSlider) {
		if (typeof this.onSliderSlide === 'function') {
			this.onSliderSlide({ values, handle, unencoded, tap, positions, noUiSlider });
		} else {
		}
	}
}


export default RangeSlider