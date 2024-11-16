// Для инициализации select использовать класс "init-custom-select"  

function getMaxWidth(elements) {
  let maxWidth = 0;

  elements.forEach(element => {
    const width = element.getBoundingClientRect().width;
    if (width > maxWidth) {
      maxWidth = width;
    }
  });

  return Math.ceil(maxWidth);
}

export class Select {
  constructor(options) {
    let defaultOptions = {
      uniqueName: null,
      initSelect: '.init-custom-select',
      selectCustom: '_select-custom',
      selectInput: '.mySelect__input',
      selectList: '.mySelect__list',
      selectOption: '.mySelect__option',
      classActive: '_select',
      activeIndex: 0,
      placeholder: '',
      isDev: false,
      isDisabled: false,
      inputHtml: `<svg class='icon icon-arrow'><use xlink:href='img/svg/sprite.svg#arrow'></use></svg>`,
      selectMinWidth: null,
      selectMaxWidth: null,
      maxHeightList: null,
      parentEl: null,
      onInit: () => { },
      onChange: () => { },
      onOpen: () => { },
      onClose: () => { },
      callbackInput: value => {
        return `<span>${value}</span><svg class='icon icon-arrow'><use xlink:href='img/svg/sprite.svg#arrow'></use></svg>`
      },
      callbackOption: value => {
        return `<span>${value}</span>`
      }
    }

    this.options = Object.assign(defaultOptions, options)

    this.onInit = this.options.onInit
    this.onChange = this.options.onChange
    this.onOpen = this.options.onOpen
    this.onClose = this.options.onClose
    this.callbackInput = this.options.callbackInput
    this.callbackOption = this.options.callbackOption

    if (this.options.uniqueName) {
      const wp = this.options.parentEl ? this.options.parentEl : document

      this.selects = wp.querySelectorAll(`select[data-special-select="${this.options.uniqueName}"]`)
    } else {
      this.selects = document.querySelectorAll(`select${this.options.initSelect}:not([data-special-select])`)
    }

    this.selectsCustom = []
    this.value = ''

    if (this.selects.length) {

    } else {
      this.options.isDev && console.log(`Ошибка: не найден select c классом "${this.options.initSelect}"`)
      return
    }


    this.init()
  }

  init() {
    this.selectsCustom = []

    this.selects.forEach(select => {
      const options = select.querySelectorAll('option')
      const selectName = select.getAttribute('name')

      const selectCustom = select.getAttribute('data-special-select') || this.options.selectCustom
      const activeIndex = select.getAttribute('data-active-index') || this.options.activeIndex
      const placeholder = select.getAttribute('data-placeholder') || this.options.placeholder
      const isDisabled = select.getAttribute('data-disabled') != null ? true : this.options.isDisabled
      const inputHtml = select.getAttribute('data-input-html') || this.options.inputHtml
      const selectMinWidth = select.getAttribute('data-select-min-width') || this.options.selectMinWidth
      const selectMaxWidth = select.getAttribute('data-select-max-width') || this.options.selectMaxWidth
      this.options.maxHeightList = select.getAttribute('data-select-max-height-list') || this.options.maxHeightList
      const prefix = select.getAttribute('data-prefix') || ''

      const customSelect = this.customSelectHtml({ selectName, selectCustom, options, activeIndex, placeholder, isDisabled, inputHtml, prefix })
      const b479 = window.matchMedia(`(min-width: 479px)`)

      const selectInput = customSelect.querySelector(this.options.selectInput)
      if (selectInput) {
        selectInput.innerHTML = this.callbackInput(options[activeIndex]?.textContent || '', options[activeIndex]?.value || '', customSelect)
      }

      select.insertAdjacentElement('afterend', customSelect)
      select.style.display = 'none'

      if (b479.matches && selectMinWidth) {
        customSelect.style.minWidth = `${+selectMinWidth}px`
      } else {
        // const maxWidth = getMaxWidth(customSelect.querySelectorAll('.mySelect__option'))
        // customSelect.style.maxWidth = selectMaxWidth ? selectMaxWidth + 'px' : maxWidth + 'px'
      }

      if (selectMaxWidth) {

      }
      this.selectValue = select.value
      this.selectsCustom.push(customSelect)
    })

    this.events()
    this.onInit(this.selectsCustom)
  }

  events() {
    this.selectsCustom.length && this.selectsCustom.forEach(select => {
      const selectInput = select.querySelector(this.options.selectInput)
      const selectInputSpan = select.querySelector(`${this.options.selectInput} span`)

      select.addEventListener('click', e => {
        if (select.classList.contains('_disabled')) return

        if (e.target.closest(this.options.selectInput)) {
          if (select.classList.contains(this.options.classActive)) {
            this.close(select)
          } else {
            this.open(select)
          }
        }

        if (e.target.closest(this.options.selectOption)) {
          const option = e.target.closest(this.options.selectOption)

          const optionValue = option.getAttribute('data-value')
          const optionContent = option.textContent
          selectInput.innerHTML = this.callbackInput(optionContent, optionValue, select)
          selectInputSpan.classList.remove('placeholder')
          // selectInputSpan.innerHTML = optionContent

          selectInput.setAttribute('data-value', optionValue)

          this.disableSelectedOption(select, optionValue)
          this.changeSelectOption(select, optionValue)
          this.close(select)

          this.onChange(e, select, optionValue)
        }
      })
    })

    window.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        this.selectsCustom.forEach(_select => this.close(_select))
      }
    })

    document.addEventListener('click', e => {
      if (!e.target.closest('.mySelect')) {
        this.selectsCustom.forEach(_select => this.close(_select))
      }
    })
  }

  open(select) {
    const selectList = select.querySelector(this.options.selectList)

    this.selectsCustom.forEach(_select => this.close(_select))
    select.classList.add(this.options.classActive)
    selectList.style.maxHeight = this.options.maxHeightList ? this.options.maxHeightList + 'px' : selectList.scrollHeight + 'px'
    if (this.options.maxHeightList) {
      selectList.style.overflowY = 'auto'
    }

    this.onOpen(select)
  }

  close(select = this.selects[0]) {
    if (select) {
      select.classList.remove(this.options.classActive)
      if (select.querySelector(this.options.selectList)) {
        select.querySelector(this.options.selectList).style.maxHeight = null
      }
    }

    this.onClose(select)
  }

  setValue(optionValue) {
    this.selectsCustom.length && this.selectsCustom.forEach(select => {
      const selectInput = select.querySelector(this.options.selectInput)
      const selectInputSpan = select.querySelector(`${this.options.selectInput} span`)

      const option = select.querySelector(`[data-value="${optionValue}"]`)
      if (!option) {
        console.log(optionValue, 'Такого значения нет в:', select)
        return
      }
      const optionText = option.textContent

      selectInputSpan.classList.remove('placeholder')
      selectInputSpan.textContent = optionText
      selectInput.setAttribute('data-value', optionValue)

      this.disableSelectedOption(select, optionValue)
      this.changeSelectOption(select, optionValue)
      this.close(select)

      // this.onChange(option, select, optionValue)
    })
  }

  disableSelectedOption(select, selectedOptionValue) {
    const options = select.querySelectorAll(this.options.selectOption)

    options.forEach(option => {
      let value = option.getAttribute('data-value')
      option.classList.remove('_none')
      option.classList.remove('_option-list')
      option.classList.add('_show')
      if (value === selectedOptionValue) {
        option.classList.add('_none')
        option.classList.remove('_show')
      }
    })

    const optionsShow = select.querySelectorAll(`${this.options.selectOption}._show`)
    optionsShow[optionsShow.length - 1].classList.add('_option-list')
  }

  changeSelectOption(select, optionValue) {
    const selectName = select.getAttribute('data-name')
    const defaultSelect = document.querySelector(`${this.options.initSelect}[name="${selectName}"]`)

    if (defaultSelect) {
      defaultSelect.value = optionValue
      this.selectValue = optionValue
    }
  }

  customSelectHtml({ selectName, selectCustom, options, activeIndex, placeholder, isDisabled, inputHtml, prefix }) {
    const mySelect = document.createElement("div")

    mySelect.classList.add('mySelect')
    mySelect.classList.add(selectCustom)
    isDisabled && mySelect.classList.add('_disabled')
    mySelect.setAttribute('data-name', selectName)

    if (options.length) {
      mySelect.innerHTML = `<div class="mySelect__input" data-value="${placeholder.length ? '' : options[activeIndex].value}">${placeholder.length ? `<span class="placeholder">${placeholder}</span>` : `<span>${prefix ? `<span class="prefix">${prefix}</span>` : ''}${options[activeIndex].innerHTML}</span>`} ${inputHtml.length ? inputHtml : ''}</div>
    <ul class="mySelect__list">
    ${Array.from(options).map(option => `<li class="mySelect__option ${options[activeIndex].value === option.value && !placeholder ? '_none' : ''}" data-value="${option.value}">${this.callbackOption(option.textContent, option.value)}</li>`).join('')}
    </ul>`
    }

    return mySelect
  }
}

export class exSelect extends Select {
  constructor(selects = [], options = {}) {
    super(options)

    this.init(selects)
  }

  init(selects) {
    this.selectsCustom = []

    selects.length && selects.forEach(select => {
      const options = select.querySelectorAll('option')
      const selectName = select.getAttribute('name')

      const selectCustom = select.getAttribute('data-special-select') || this.options.selectCustom
      const activeIndex = select.getAttribute('data-active-index') || this.options.activeIndex
      const placeholder = select.getAttribute('data-placeholder') || this.options.placeholder
      const isDisabled = select.getAttribute('data-disabled') != null ? true : this.options.isDisabled
      const inputHtml = select.getAttribute('data-input-html') || this.options.inputHtml
      const selectMinWidth = select.getAttribute('data-select-min-width') || this.options.selectMinWidth
      const selectMaxWidth = select.getAttribute('data-select-max-width') || this.options.selectMaxWidth
      const prefix = select.getAttribute('data-prefix') || ''

      const customSelect = this.customSelectHtml({ selectName, selectCustom, options, activeIndex, placeholder, isDisabled, inputHtml, prefix })
      const b479 = window.matchMedia(`(min-width: 479px)`)

      if (b479.matches && selectMinWidth) {
        customSelect.style.minWidth = `${+selectMinWidth}px`
      }

      const selectInput = customSelect.querySelector(this.options.selectInput)
      if (selectInput) {
        selectInput.innerHTML = this.callbackInput(options[activeIndex]?.textContent || '', options[activeIndex]?.value || '', customSelect)
      }

      select.insertAdjacentElement('afterend', customSelect)
      select.style.display = 'none'

      this.selectsCustom.push(customSelect)
    })

    this.events()
    this.onInit(this.selectsCustom)
  }
}