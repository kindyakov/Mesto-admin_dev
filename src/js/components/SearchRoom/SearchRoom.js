import tippy from '../../configs/tippy.js'
import { createElement } from "../../settings/createElement.js"
import { searchModalHtml, itemHtml } from "./html.js"
import { Loader } from "../../modules/myLoader.js";
import { api } from "../../settings/api.js";
import { itemEl } from "../Modals/utils/html.js";

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
  constructor(el, options = {}, params = {}) {
    this.options = Object.assign({
      onShow: this.onShow.bind(this)
    }, defaultOptions, options)
    this.params = Object.assign({}, {
      isOne: false
    }, params)

    this.tippy = tippy(el, { ...this.options, content: this.content })
    this.timer = null
    this.roomIds = []
    this.selectedRoomIds = []
    this.onSelect = () => { }

    this.init()
  }

  onShow(instance) {
    this.searchRoomId()
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
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        this.tippy.hide()
      }
    })
  }

  content(reference) {
    const wrapper = createElement('div', { classes: ['search-modal'] })
    wrapper.innerHTML = searchModalHtml()
    return wrapper
  }

  handleInput(e) {
    const input = e.target
    const value = this.fractionalNumber(input)

    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      const sortRoomIds = value ? this.roomIds.filter(({ room_id }) => room_id.toString().includes(value)) : this.roomIds
      this.render(sortRoomIds)
    })
  }

  handleClick() {
    if (this.selectedRoomIds.length) {
      this.renderSelected(this.selectedRoomIds)
    }
    this.clear()
  }

  handleChange(e) {
    const inputCheckbox = e.target.closest('.input-checkbox')
    if (!inputCheckbox) return
    const value = +inputCheckbox.value

    if (this.params.isOne) {
      if (inputCheckbox.checked) {
        this.selectedRoomIds = [value]
      }
    } else {
      if (inputCheckbox.checked) {
        this.selectedRoomIds.push(value)
      } else {
        this.selectedRoomIds = this.selectedRoomIds.filter(id => id !== value)
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
  }

  reset() {
    this.tippy.reference.classList.remove('just-validate-error-field')
    this.tippy.reference.innerHTML = ''
    this.selectedRoomIds = []
    this.tippy.enable()
  }

  renderSelected(ids) {
    this.tippy.disable()
    this.tippy.reference.innerHTML = ''

    this.tippy.reference.append(
      ...this.selectedRoomIds.map(id => itemEl(id,
        curId => {
          this.selectedRoomIds = this.selectedRoomIds.filter(_id => _id !== curId)

          if (!this.selectedRoomIds.length) {
            this.tippy.enable()
            setTimeout(() => this.tippy.show())
          }

          this.onSelect(this.selectedRoomIds)
        }
      ))
    )

    this.tippy.reference.classList.remove('just-validate-error-field')

    this.onSelect(this.selectedRoomIds)
  }

  render(room_ids) {
    this.contentSearch.innerHTML = ''

    if (room_ids.length) {
      this.selectedRoomIds.length && this.selectedRoomIds.forEach(id => {
        this.contentSearch.insertAdjacentHTML('beforeend', itemHtml(id, true, this.params.isOne ? 'radio' : 'checkbox'))
      })

      room_ids.forEach(obj => {
        this.contentSearch.insertAdjacentHTML('beforeend', itemHtml(obj.room_id, undefined, this.params.isOne ? 'radio' : 'checkbox'))
      })
    } else {
      if (this.selectedRoomIds.length) {
        this.selectedRoomIds.length && this.selectedRoomIds.forEach(id => {
          this.contentSearch.insertAdjacentHTML('beforeend', itemHtml(id, true, this.params.isOne ? 'radio' : 'checkbox'))
        })
      } else {
        this.contentSearch.innerHTML = `<div class="not-data"><span>Не найдено</span></div>`
      }
    }
  }

  async searchRoomId(str) {
    try {
      this.loader.enable()
      const response = await api.get(`/_get_free_room_ids_`) // ?search_str=${str}
      if (response.status !== 200) return
      const { room_ids = [] } = response.data
      this.roomIds = room_ids
      this.render(room_ids)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default SearchRoom