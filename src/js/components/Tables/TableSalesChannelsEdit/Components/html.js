export function contentHtml(data) {
  return `
  <div class="filter">
  <div class="filter__top">
    <h4 class="filter__title">Добавить канал продаж</h4>
  </div>
  <div class="filter__content">
    <div class="filter__block">
      <span class="filter__block_name">Название канала:</span>
      <div class="wp-input">
        <input type="text" name="" class="input" autocomplete="off" placeholder="Введите название" style="height: 40px;">
      </div>
    </div>
  </div>
  <div class="filter__footer">
    <button class="filter__button button btn-add"><span>Добавить</span></button>
  </div>
</div>`
}