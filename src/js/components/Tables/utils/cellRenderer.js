export function cellRendererInput(params, func = val => val, iconId = null) {
  const wpInput = document.createElement('div');
  wpInput.classList.add('wp-input', 'wp-input-cell')

  if (iconId) {
    const icon = `<svg class='icon icon-${iconId}'><use xlink:href='img/svg/sprite.svg#${iconId}'></use></svg>`
    wpInput.insertAdjacentHTML('afterbegin', icon)
    wpInput.classList.add('is-icon')
  }

  wpInput.insertAdjacentHTML('beforeend', `<input type="text" name="${params.colDef.field}" value="${params.value ? func(params.value) : ''}" class="input-cell cell-input not-edit" autocomplete="off" readonly="true">`);
  return wpInput;
}