import { paginationHtml } from './html.js';
import { exSelect } from '../../modules/mySelect.js';
import { createElement } from "../../settings/createElement.js"

const defaultOptions = {
  pageSize: 5,
  countBtn: 5,
  pageSizeSelector: [5, 10, 15, 20, 30, 0],
  onChangeShowCount: () => { },
  onPageChange: () => { },
}

class Pagination {
  constructor(wrapper, options = {}) {
    if (!wrapper) return
    this.wrapper = wrapper
    this.options = Object.assign({}, defaultOptions, options)

    this.page = null
    this.pages = null
    this.cntAll = null

    this.onChangeShowCount = this.options.onChangeShowCount
    this.onPageChange = this.options.onPageChange

    this.init()
  }

  init() {
    this.el = createElement('div', { classes: ['pagination'], content: paginationHtml.pagination() })
    this.wrapper.insertAdjacentElement('beforeend', this.el)

    this.tablePaginationPages = this.el.querySelector(`.pagination-pages`)
    this.tablePaginationBtnPrev = this.el.querySelector(`.btn-pagination-prev`)
    this.tablePaginationBtnNext = this.el.querySelector(`.btn-pagination-next`)

    this.pagingShowCount = createElement('div', {
      content: `<span>Показывать по</span>`,
      classes: ['paging-show-count'],
    })
    // Кастомный переключатель
    const select = createElement('select', {
      attributes: [['name', 'count-rows']],
      content: this.renderOptions(this.options.pageSizeSelector)
    })

    this.pagingShowCount.appendChild(select)
    this.wrapper.insertAdjacentElement('afterbegin', this.pagingShowCount)

    this.customPageSize = new exSelect([select], { selectMinWidth: 80, })
    this.customPageSize.setValue(this.options.pageSize)

    this.events()
  }

  events() {
    this.el.addEventListener('click', e => {
      if (e.target.closest('.btn-pagination-prev')) {
        this.prevPage()
      }

      if (e.target.closest('.btn-pagination-next')) {
        this.nextPage()
      }

      if (e.target.closest('.btn-page')) {
        this.handleBtnPage(e)
      }
    })

    this.customPageSize.onChange = (e, select, value) => {
      const count = value == 0 ? +this.cntAll : value
      this.onChangeShowCount(count, this.cntAll)
    }
  }

  setPage(page, pages, cntAll) {
    this.page = page;
    this.pages = pages;
    this.cntAll = cntAll;
    this.updatePaginationControls(page, pages);
  }

  updatePaginationControls(currentPage, totalPages) {
    if (!this.tablePaginationPages) return;
    
    // Очистка текущей пагинации
    this.tablePaginationPages.innerHTML = '';

    const paginationArray = [];
    const countBtn = this.options.countBtn = 5;
    const halfBtnCount = Math.floor(countBtn / 1.1);

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - halfBtnCount && i <= currentPage + halfBtnCount)) {
        paginationArray.push(i);
      } else if (i === currentPage - halfBtnCount - 1 || i === currentPage + halfBtnCount + 1) {
        paginationArray.push('...');
      }
    }

    paginationArray.forEach(page => {
      this.tablePaginationPages.insertAdjacentHTML('beforeend', paginationHtml.li(page, page === currentPage));
    });
  }

  prevPage() {
    if (+this.page > 1) {
      this.page--;
      this.updatePaginationControls(this.page, this.pages);
      this.onPageChange(this.page, this.cntAll);
    }
  }

  handleBtnPage(e) {
    const btn = e.target.closest('.btn-page')
    const page = btn.getAttribute('data-page');
    if (page === '...') return;
    if (parseInt(page, 10) !== this.page) {
      this.page = parseInt(page, 10)
      this.updatePaginationControls(this.page, this.pages)
      this.onPageChange(this.page);
    }
  }

  nextPage() {
    if (+this.page < this.pages) {
      this.page++;
      this.updatePaginationControls(this.page, this.pages);
      this.onPageChange(this.page);
    }
  }

  renderOptions(selectors) {
    return selectors.map(v => `<option value="${v}">${v == 0 ? 'все' : v}</option>`).join(',')
  }
}

export default Pagination