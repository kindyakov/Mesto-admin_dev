export function itemHtml(id) {
  return `
            <div class="custom-input__item">
              <span>${id}</span>
              <button class="btn-del" data-room-id="${id}">
                <svg class='icon-close'>
                  <use xlink:href='img/svg/sprite.svg#close'></use>
                </svg>
              </button>
            </div>`
}