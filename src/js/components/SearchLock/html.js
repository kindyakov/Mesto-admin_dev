export function searchModalHtml() {
  return `
  <div class="search-modal__header">
    <h5 class="search-modal__title">Выбрать замок</h5>
  </div>
  <div class="search-modal__body">
    <div>
      <div class="wp-input" style="margin-top: 5px;">
        <input type="text" name="search_str" autocomplete="off" class="input hide-arrow" placeholder="Поиск...">
      </div>
    </div>

    <div class="search-modal__content custom-scroll" style="max-height: 200px; overflow-y: auto; gap: 0;">
      
    </div>
  </div>
`
}

export function itemHtml(lock) {
  return `
    <div class="search-modal__item item-lock" data-id="${lock}" data-num="${lock}" style="cursor: pointer; padding: 5px 10px; border-bottom: 1px solid #eee; display: flex; align-items: center;">
      <span style="font-weight: 500;">№${lock}</span>
    </div>`
}