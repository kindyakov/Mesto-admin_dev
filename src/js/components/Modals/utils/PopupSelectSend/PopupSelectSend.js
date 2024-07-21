import tippy from 'tippy.js'
import popupContent from './popupContent.html'

export function PopupSelectSend(container, options = {}) {
  const instance = tippy(container, {
    content: popupContent,
    allowHTML: true,
    trigger: 'manual',
    interactive: true,
    appendTo: container.parentElement,
    // placement: 'top',
    duration: 0,
    arrow: false,
    maxWidth: 630,
    onCreate(instance) {
      const contentWrapper = instance.popper.querySelector('.modal__body');
      const buttons = contentWrapper.querySelectorAll('button');

      buttons.length && buttons.forEach(btn => {
        btn.addEventListener('click', function () {
          if (instance.onClick) {
            instance.onClick(this.getAttribute('data-send'));
          }
          instance.hide();
        });
      });
    },
    ...options
  });

  return instance
}