export function initializeModalTriggers(modalMap) {
  document.addEventListener('click', e => {
    const button = e.target.closest('[data-modal]');
    if (button) {
      const modalClass = button.getAttribute('data-modal');
      const modalInstance = modalMap[modalClass];
      if (modalInstance) {
        modalInstance.open(button);
      }
    }
  });
}