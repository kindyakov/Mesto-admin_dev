export function cellRendererInput(params, func = val => val, iconId = null, dopEl = null) {
  const wpInput = document.createElement('div');
  wpInput.classList.add('wp-input', 'wp-input-cell', 'not-edit')

  if (dopEl) {
    wpInput.classList.add('is-dop-content')
    dopEl.classList.add('dop-el-content')
  }

  if (iconId) {
    const icon = `<svg class='icon icon-${iconId}'><use xlink:href='img/svg/sprite.svg#${iconId}'></use></svg>`
    wpInput.insertAdjacentHTML('afterbegin', icon)
    wpInput.classList.add('is-icon')
  }

  wpInput.insertAdjacentHTML('beforeend', `<input type="text" name="${params.colDef.field}" value="${params.value ? func(params.value) : ''}" class="input-cell cell-input not-edit" autocomplete="off" readonly="true">${dopEl ? dopEl.outerHTML : ''}`);
  return wpInput;
}