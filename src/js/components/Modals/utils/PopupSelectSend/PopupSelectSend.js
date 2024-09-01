import tippy from '../../../../configs/tippy.js'
import popupContent from './popupContent.html'

export function PopupSelectSend(container, options = {}) {
  const instance = tippy(container, {
    content: popupContent,
    trigger: 'manual',
    appendTo: container.parentElement,
    maxWidth: 630,
    onCreate(instance) {
      const contentWrapper = instance.popper.querySelector('.modal__body');
      const buttons = contentWrapper.querySelectorAll('button');

      buttons.length && buttons.forEach(btn => {
        btn.addEventListener('click', function () {
          instance.hide();
          if (instance.onClick) {
            instance.onClick(this.getAttribute('data-send'));
          }
        });
      });
    },
    ...options
  });

  return instance
}