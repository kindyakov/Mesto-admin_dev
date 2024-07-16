export function searchModalHtml() {
  return `
  <div class="search-modal__header">
    <h5 class="search-modal__title">Выбрать ячейку</h5>
  </div>
  <div class="search-modal__body">
    <div>
      <span>Поиск:</span>
      <div class="wp-input" style="margin-top: 5px;">
        <input type="text" name="search_str" autocomplete="off" class="input" placeholder="Введите номер ячейки">
      </div>
    </div>

    <div class="search-modal__content">
      
    </div>
  </div>
  <div class="search-modal__footer">
    <button class="button btn-select"><span>Выбрать</span></button>
  </div>
`
}

export function itemHtml(room_id, isChecked = false, type = 'checkbox') {
  return `
            <label class="search-modal__item">
              <input type="${type}" class="input-checkbox" name="room_id" id="input-checkbox-${room_id}" value="${room_id}" ${isChecked ? 'checked' : ''}>
              <label for="input-checkbox-${room_id}" class="label-checkbox">
                <svg class='icon icon-check-3'>
                  <use xlink:href='img/svg/sprite.svg#check-3'></use>
                </svg>
              </label>
              <span>${room_id}</span>
            </label>`
}