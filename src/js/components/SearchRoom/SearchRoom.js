import tippy from "tippy.js";
import { createElement } from "../../settings/createElement.js"
import { searchModalHtml, itemHtml } from "./html.js"
import { Loader } from "../../modules/myLoader.js";
import { api } from "../../settings/api.js";

const defaultOptions = {
  allowHTML: true,
  trigger: 'click',
  maxWidth: 300,
  duration: 0,
  placement: 'bottom-start',
  interactive: true,
  appendTo: document.body,
}

class SearchRoom {
  constructor(el, options = {}) {
    this.options = Object.assign({}, defaultOptions, options)

    this.tippy = tippy(el, { ...this.options, content: this.content })
    this.timer = null
    this.roomIds = []
    this.onSelect = () => { }

    this.init()
  }

  init() {
    if (!this.tippy.popper) return
    this.modal = this.tippy.popper.querySelector('.search-modal')
    this.loader = new Loader(this.modal)
    this.inputSearch = this.modal.querySelector('.input')
    this.contentSearch = this.modal.querySelector('.search-modal__content')
    this.btn = this.modal.querySelector('.btn-select')

    this.inputSearch.addEventListener('input', this.handleInput.bind(this))
    this.btn.addEventListener('click', this.handleClick.bind(this))
    this.modal.addEventListener('change', this.handleChange.bind(this))
  }

  content(reference) {
    const wrapper = createElement('div', ['search-modal'])
    wrapper.innerHTML = searchModalHtml()
    return wrapper
  }

  handleInput(e) {
    const input = e.target
    const value = this.fractionalNumber(input)

    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.searchRoomId(value)
    }, 500)
  }

  handleClick() {
    this.onSelect(this.roomIds)
    this.clear()
  }

  handleChange(e) {
    const inputCheckbox = e.target.closest('.input-checkbox')

    if (inputCheckbox) {
      if (inputCheckbox.checked) {
        this.roomIds.push(+inputCheckbox.value)
      } else {
        const index = this.roomIds.findIndex(id => id === +inputCheckbox.value)
        this.roomIds.splice(index, 1)
      }
    }
  }

  fractionalNumber(input) {
    let value = input.value;
    const regex = /^\d+(\.\d{0,1})?$/

    // Если значение не соответствует требованиям, корректируем его
    if (!regex.test(value)) {
      value = parseFloat(value)
      input.value = isNaN(value) ? '' : value
    }

    return value
  }

  clear() {
    this.tippy.hide()
    this.contentSearch.innerHTML = ''
    this.inputSearch.value = ''
    this.roomIds = []
  }

  async searchRoomId(str) {
    try {
      this.loader.enable()
      const response = await api.get(`/_search_room_id_?search_str=${str}`)
      if (response.status !== 200) return
      const { room_ids = [] } = response.data

      this.contentSearch.innerHTML = ''

      if (room_ids.length) {
        this.roomIds.length && this.roomIds.forEach(id => {
          this.contentSearch.insertAdjacentHTML('beforeend', itemHtml(id, true))
        })

        room_ids.forEach(obj => {
          this.contentSearch.insertAdjacentHTML('beforeend', itemHtml(obj.room_id))
        })
      } else {
        if (this.roomIds.length) {
          this.roomIds.length && this.roomIds.forEach(id => {
            this.contentSearch.insertAdjacentHTML('beforeend', itemHtml(id, true))
          })
        } else {
          this.contentSearch.innerHTML = `<div class="not-data"><span>Не найдено</span></div>`
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default SearchRoom