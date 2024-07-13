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