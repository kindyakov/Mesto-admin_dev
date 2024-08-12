import tippy from '../../../configs/tippy.js';

let defaultOptions = {
  tippyInstance: null,
  isEdit: false,
  buttons: [
    (options = {}) => {
      const button = document.createElement('button')
      button.classList.add('tippy-button', 'table-tippy-client__button', 'btn-edit-row-table')
      button.innerHTML = `
      <svg class='icon icon-edit'>
        <use xlink:href='img/svg/sprite.svg#edit'></use>
      </svg>
      <span>Редактировать</span>`

      return button
    },
    (options = {}) => {
      const button = document.createElement('button')
      button.classList.add('tippy-button', 'table-tippy-client__button', 'btn-open')
      button.innerHTML = `
      <svg class='icon icon-arrow-right-circle' styles="fill: none;">
        <use xlink:href='img/svg/sprite.svg#arrow-right-circle'></use>
      </svg>
      <span>Открыть</span>`

      return button
    }
  ],
  onEdit: () => { },
  onEnableEdit: () => { },
  onOpen: () => { }
}

export function actions(button, opt = {}) {
  const options = Object.assign({ toggleEdit, toggleActive }, defaultOptions, opt)

  const instance = tippy(button, {
    maxWidth: 180,
    content: (reference) => {
      const content = document.createElement('div')
      content.classList.add('tippy', 'table-tippy-client')

      options.buttons.forEach(func => {
        const btn = func()
        btn.setAttribute('data-json', JSON.stringify(options.data))

        if (btn.classList.contains('btn-open')) {
          btn.setAttribute('data-modal', options.attrModal)
        }

        btn.addEventListener('click', handleClick)

        content.appendChild(btn)
      })

      function handleClick(e) {
        if (e.target.closest('.btn-edit-row-table')) {
          toggleEdit(button)
          options.isEdit = true
          options.onEnableEdit(options)
        }

        options.tippyInstance.hide() // Закрывает всплывающее окно
      }

      return content
    },
    onTrigger(instance, event) {
      options.tippyInstance = instance; // Сохраняем ссылку на экземпляр tippy.js
      if (options.isEdit) {
        options.onEdit(options)
      }
    },
    onShow(instance) {
      if (options.isEdit) {
        return false; // Запрещаем открытие tippy, если редактирование активно
      }
      toggleActive(button)
    },
    onHide(instance) {
      toggleActive(button)
    },
  });

  function toggleEdit(button) {
    button.classList.toggle('_edit');
  }

  function toggleActive(button) {
    button.classList.toggle('_active');
  }

  instance.options = options

  return instance
}