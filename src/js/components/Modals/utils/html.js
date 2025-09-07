import { createElement } from "../../../settings/createElement.js"

export function itemEl(id, onClick = () => { }) {
  const div = createElement('div', { classes: ['custom-input__item'], content: `<span>${id}</span>` })
  const button = createElement('span', {
    classes: ['btn-del'], content: `<svg class='icon-close'><use xlink:href='#close'></use></svg>`
  })
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