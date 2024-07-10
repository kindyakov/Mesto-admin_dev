export function filterHtml(data) {
  return `
  <div class="filter-rooms">
    <div class="filter-rooms__content">
      <div class="filter-rooms__block">
        <span class="filter-rooms__block_name">Площадь:</span>
        <div class="filter-rooms__block_content">
          <div class="filter-rooms__wp-input">
            <span class="pref">от</span>
            <input type="text" name="area_start" value="0" class="filter-rooms__input input-filter-rooms" inputmode="tel" autocomplete="off">
          </div>
          <div class="filter-rooms__wp-input">
            <span class="pref">до</span>
            <input type="text" name="area_end" value="10" class="filter-rooms__input input-filter-rooms" inputmode="tel" autocomplete="off">
          </div>
        </div>
      </div>
      <div class="filter-rooms__block">
        <span class="filter-rooms__block_name">Цена:</span>
        <div class="filter-rooms__block_content">
          <div class="filter-rooms__wp-input">
            <span class="pref">от</span>
            <input type="text" name="price_start" value="0" class="filter-rooms__input input-filter-rooms" inputmode="tel" autocomplete="off">
          </div>
          <div class="filter-rooms__wp-input">
            <span class="pref">до</span>
            <input type="text" name="price_end" value="30000" class="filter-rooms__input input-filter-rooms" inputmode="tel" autocomplete="off">
          </div>
        </div>
      </div>
      <div class="filter-rooms__block">
        <span class="filter-rooms__block_name">Длина:</span>
        <div class="filter-rooms__block_content">
          <div class="filter-rooms__wp-input">
            <span class="pref">от</span>
            <input type="text" name="length_start" value="0" class="filter-rooms__input input-filter-rooms" inputmode="tel" autocomplete="off">
          </div>
          <div class="filter-rooms__wp-input">
            <span class="pref">до</span>
            <input type="text" name="length_end" value="4" class="filter-rooms__input input-filter-rooms" inputmode="tel" autocomplete="off">
          </div>
        </div>
      </div>
      <div class="filter-rooms__block">
        <span class="filter-rooms__block_name">Ширина:</span>
        <div class="filter-rooms__block_content">
          <div class="filter-rooms__wp-input">
            <span class="pref">от</span>
            <input type="text" name="width_start" value="0" class="filter-rooms__input input-filter-rooms" inputmode="tel" autocomplete="off">
          </div>
          <div class="filter-rooms__wp-input">
            <span class="pref">до</span>
            <input type="text" name="width_end" value="3" class="filter-rooms__input input-filter-rooms" inputmode="tel" autocomplete="off">
          </div>
        </div>
      </div>
      <div class="filter-rooms__block">
        <span class="filter-rooms__block_name">Высота:</span>
        <div class="filter-rooms__block_content">
          <div class="filter-rooms__wp-input">
            <span class="pref">от</span>
            <input type="text" name="height_start" value="0" class="filter-rooms__input input-filter-rooms" inputmode="tel" autocomplete="off">
          </div>
          <div class="filter-rooms__wp-input">
            <span class="pref">до</span>
            <input type="text" name="height_end" value="4" class="filter-rooms__input input-filter-rooms" inputmode="tel" autocomplete="off">
          </div>
        </div>
      </div>
    </div>
    <div class="filter-rooms__footer">
      <button class="filter-rooms__button button btn-filter-apply"><span>Применить</span></button><button
        class="filter-rooms__button button transparent btn-filter-clear"><span>Очистить фильтр</span></button>
    </div>
  </div>`
}