export class Loader {
  constructor(wrapper, options) {
    let defaultoptions = {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      styleLoader: '',
      styleWpLoader: '',
      isHidden: true,
      position: 'absolute',
      customSelector: '_custom-loader',
      isCreate: true,
      id: ''
    }
    this.options = Object.assign(defaultoptions, options)
    this.wrapper = wrapper
    this.loader
    this.createLoader()
  }

  createLoader() {
    if (this.wrapper) {
      if (!this.wrapper.querySelector(`.wpLoader.${this.options.customSelector}`) && this.options.isCreate) {
        // Создаем wrapper для loader
        const wpLoader = document.createElement('div');
        wpLoader.className = `wpLoader ${this.options.customSelector}`;

        // Устанавливаем стили для wpLoader
        wpLoader.style.backgroundColor = this.options.backgroundColor;
        wpLoader.style.position = this.options.position;
        if (this.options.styleWpLoader) {
          wpLoader.style.cssText += this.options.styleWpLoader;
        }

        // Создаем span loader
        const loaderSpan = document.createElement('span');
        loaderSpan.className = 'loader';
        if (this.options.styleLoader) {
          loaderSpan.style.cssText = this.options.styleLoader;
        }

        // Добавляем span в wpLoader
        wpLoader.appendChild(loaderSpan);

        // Добавляем wpLoader в начало wrapper
        this.wrapper.insertBefore(wpLoader, this.wrapper.firstChild);

        // Устанавливаем стили для wrapper
        this.wrapper.style.position = 'relative';
        if (this.options.isHidden) {
          this.wrapper.style.overflow = 'hidden';
        }
      }
      this.loader = this.wrapper.querySelector(`.wpLoader`)
    } else {
      // console.log('Ошибка элемент не найден:', this.wrapper)
    }
  }

  enable() {
    if (this.options.id) {
      this.loader.setAttribute('data-loader-id', this.options.id)
    }
    this.loader.classList.add('_load')
  }

  disable() {
    if (this.options.id) {
      if (this.options.id === this.loader.getAttribute('data-loader-id')) {
        this.loader.classList.remove('_load')
      }
    } else {
      this.loader.classList.remove('_load')
    }
  }

  remove() {
    this.loader.remove()
  }
}