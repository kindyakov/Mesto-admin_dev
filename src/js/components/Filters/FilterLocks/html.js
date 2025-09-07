export function filterHtml(data) {
  return `
  <div class="filter">
  <div class="filter__content">

    <div class="filter__block">
      <span class="filter__block_name">Заряд:</span>
      <div class="filter__block_content">
        <div class="filter__wp-input">
          <span class="pref">от</span>
          <input type="text" name="electric-quantity_start" value="0" data-step="1" class="filter__input input-filter"
            inputmode="decimal" autocomplete="off">
        </div>
        <div class="filter__wp-input">
          <span class="pref">до</span>
          <input type="text" name="electric-quantity_end" value="100" data-step="1" class="filter__input input-filter"
            inputmode="decimal" autocomplete="off">
        </div>
      </div>
    </div>
    <div class="filter__block">
      <div class="filter__list">
        <label>
          <input name="" type="checkbox" value="0" class="filter__input input-checkbox" id="filter-input--0">
          <label for="filter-input--0" class="label-checkbox">
            <svg class='icon icon-check-3'>
              <use xlink:href='#check-3'></use>
            </svg>
          </label>
          <span>Разряжен</span>
        </label>
        <label>
          <input name="" type="checkbox" value="0" class="filter__input input-checkbox" id="filter-input--1">
          <label for="filter-input--1" class="label-checkbox">
            <svg class='icon icon-check-3'>
              <use xlink:href='#check-3'></use>
            </svg>
          </label>
          <span>Сломан</span>
        </label>
        <label>
          <input name="" type="checkbox" value="0" class="filter__input input-checkbox" id="filter-input--2">
          <label for="filter-input--2" class="label-checkbox">
            <svg class='icon icon-check-3'>
              <use xlink:href='#check-3'></use>
            </svg>
          </label>
          <span>Норм</span>
        </label>
        <label>
          <input name="" type="checkbox" value="0" class="filter__input input-checkbox" id="filter-input--3">
          <label for="filter-input--3" class="label-checkbox">
            <svg class='icon icon-check-3'>
              <use xlink:href='#check-3'></use>
            </svg>
          </label>
          <span>И т.д</span>
        </label>
      </div>
    </div>
  </div>
  <div class="filter__footer">
    <button class="filter__button button btn-filter-apply"><span>Применить</span></button><button
      class="filter__button button transparent btn-filter-clear"><span>Очистить фильтр</span></button>
  </div>
</div>`
}