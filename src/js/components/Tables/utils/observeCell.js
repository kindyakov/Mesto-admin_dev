export function observeCell(wp, params) {
  wp.setAttribute('user-id', params.data.user_id ? params.data.user_id : '')
  wp.setAttribute('data-modal', 'modal-client');
  wp.classList.add('cursor-pointer')

  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach(mutation => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (mutation.target.classList.contains('not-edit')) {
          mutation.target.setAttribute('data-modal', 'modal-client');
        } else {
          mutation.target.removeAttribute('data-modal');
        }
      }
    });
  });

  observer.observe(wp, { attributes: true }); // Навешивание слежения

  // Периодическая проверка на наличие элемента в DOM
  const intervalId = setInterval(() => {
    if (!document.body.contains(wp)) {
      observer.disconnect();
      clearInterval(intervalId);
    }
  }, 1000);
}
