export function tippyTableActionsHtml(data) {
  return `
      <div class="tippy table-tippy-client">
        <button class="tippy-button table-tippy-client__button btn-edit-row-table">
          <svg class='icon icon-edit'>
            <use xlink:href='img/svg/sprite.svg#edit'></use>
          </svg>
          <span>Редактировать</span>
        </button>
        <button class="tippy-button table-tippy-client__button btn-open-row-table btn-open-modal-client">
          <svg class='icon icon-arrow-right-circle' styles="fill: none;">
            <use xlink:href='img/svg/sprite.svg#arrow-right-circle'></use>
          </svg>
          <span>Открыть</span>
        </button>
      </div>`
}