import { createElement } from "../../../settings/createElement.js"

export function itemEl(id, onClick = () => { }) {
  const div = createElement('div', ['custom-input__item'], `<span>${id}</span>`)
  const button = createElement('span', ['btn-del'], `<svg class='icon-close'><use xlink:href='img/svg/sprite.svg#close'></use></svg>`)
  button.setAttribute('data-room-id', id)

  const handleClick = () => {
    onClick(id)
    button.removeEventListener('click', handleClick)
    div.remove()
  }

  button.addEventListener('click', handleClick)
  div.appendChild(button)

  return div
}