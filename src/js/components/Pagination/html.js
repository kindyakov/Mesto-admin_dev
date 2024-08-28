export const paginationHtml = {
  pagination: () => `
      <button class="pagination__button-arrow button-arrow btn-pagination-prev">
        <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon">
          <path d="M8 1L2 7L8 13" stroke-width="2" />
        </svg>
      </button>
      <ul class="pagination__pages pagination-pages">
      </ul>
      <button class="pagination__button-arrow button-arrow btn-pagination-next">
        <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon">
          <path d="M1 1L7 7L1 13" stroke-width="2" />
        </svg>
      </button>`,
  li: (page, isActive) => `<li><button class="pagination__button-page btn-page ${isActive ? '_active' : ''}" data-page="${page}"></button></li>`
}