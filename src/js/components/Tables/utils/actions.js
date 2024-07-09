import tippy from 'tippy.js';
import { tippyTableActionsHtml } from '../html.js';

let defaultOptions = {
  tippyInstance: null,
  isEdit: false,
  onEdit: () => { },
  onEnableEdit: () => { },
  onOpen: () => { }
}

export function actions(button, opt = {}) {
  const options = Object.assign({ toggleEdit, toggleActive }, defaultOptions, opt)

  const instance = tippy(button, {
    allowHTML: true,
    trigger: 'click',
    content: (reference) => {
      const content = tippyTableActionsHtml();
      const wrapper = document.createElement('div');
      wrapper.innerHTML = content;

      wrapper.querySelector('.btn-edit-row-table').addEventListener('click', () => {
        toggleEdit(button)
        options.isEdit = true
        options.tippyInstance.hide() // Закрывает всплывающее окно
        options.onEnableEdit(options)
      });

      wrapper.querySelector('.btn-open-row-table').addEventListener('click', () => {
        options.tippyInstance.hide() // Закрывает всплывающее окно
        options.onOpen()
      });

      return wrapper;
    },
    maxWidth: 180,
    duration: 0,
    placement: 'bottom-start',
    interactive: true,
    appendTo: document.body,
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