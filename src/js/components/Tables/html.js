export const paginationHtml = {
  pagination: () => `
    <div class="table-pagination">
      <button class="table-pagination__button-arrow button-arrow btn-pagination-prev">
        <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon">
          <path d="M8 1L2 7L8 13" stroke-width="2" />
        </svg>
      </button>
      <ul class="table-pagination__pages table-pagination-pages">
      </ul>
      <button class="table-pagination__button-arrow button-arrow btn-pagination-next">
        <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon">
          <path d="M1 1L7 7L1 13" stroke-width="2" />
        </svg>
      </button>
    </div>`,
  li: (page, isActive) => `<li><button class="table-pagination__button-page btn-page ${isActive ? '_active' : ''}" data-page="${page}"></button></li>`
}

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