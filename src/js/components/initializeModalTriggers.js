export function initializeModalTriggers(modalMap) {
  document.addEventListener('click', e => {
    const button = e.target.closest('[data-modal]');
    const currentModalEl = e.target.closest('.tingle-modal')
    if (!button) return

    const modalClass = button.getAttribute('data-modal');
    const modalInstance = modalMap[modalClass];
    if (!modalInstance) return

    if (currentModalEl) {
      const currentModalInstance = modalMap[currentModalEl.classList[1]];
      if (!currentModalInstance) return

      if (currentModalInstance.isEdit) {
        currentModalInstance.nextModal = { modalInstance, button }
      } else {
        modalInstance.open(button);
      }
    } else {
      modalInstance.open(button);
    }

    window.app.logsModal.push(modalInstance)
  });
}