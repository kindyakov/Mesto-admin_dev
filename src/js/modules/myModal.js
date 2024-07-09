export class Modal {
  static eventHandlersInitialized = false
  static currentModalInstance = null

  constructor(options) {
    let defaultoptions = {
      modalBtnClose: '.modal__close',
      classActive: '_active',
      modalContent: 'modal__body',
      isClose: true,
      isAnimation: false,
      unique: null,
      isOpen: false,
      onOpen: () => { },
      onClose: () => { }
    }

    this.options = Object.assign(defaultoptions, options)
    this.modals = document.querySelectorAll('.modal')
    this.speed = 300
    this.isOpen = false
    this.modalContainer = false

    this.mouseDownTarget = null
    this.modalActive = null

    this.onOpen = this.options.onOpen
    this.onClose = this.options.onClose

    // if (!Modal.eventHandlersInitialized) {
    //   this.initializeGlobalEventHandlers();
    //   Modal.eventHandlersInitialized = true;
    // }

    this.init()
  }

  init() {
    if (this.options.unique) {
      this.modal = document.querySelector(`[data-special-modal="${this.options.unique}"]`)
      this.modalBody = this.modal.querySelector(`.modal__body`)
      if (this.options.isOpen) {
        this.open(`.${this.options.unique}`)
      }
    }

    this.modals.length && this.modals.forEach(modal => {
      this.modalBtnClose = modal.getAttribute('data-modal-close') || this.options.modalBtnClose
    })

    this.initializeGlobalEventHandlers()
  }

  initializeGlobalEventHandlers() {
    document.addEventListener('click', (e) => this.handleDocumentClick(e));
    document.addEventListener('mousedown', (e) => this.handleDocumentMouseDown(e));
    document.addEventListener('mouseup', (e) => this.handleDocumentMouseUp(e));
    window.addEventListener('keyup', (e) => this.handleDocumentKeyUp(e));
  }

  handleDocumentClick(e) {
    if (e.target.closest('[data-modal]')) {
      e.preventDefault();
      const btn = e.target.closest('[data-modal]');
      const modalSelector = btn.getAttribute('data-modal');

      if (!modalSelector) {
        console.error('У кнопки не задан селектор модального окна:', btn);
        return;
      }

      this.open(modalSelector, e);
    }

    if (e.target.closest(this.modalBtnClose)) {
      if (e.target.closest('.modal')?.classList.contains('_active')) {
        this.options.isClose && this.close();
      }
    }
  }

  handleDocumentMouseDown(e) {
    this.mouseDownTarget = e.target;
  }

  handleDocumentMouseUp(e) {
    if (this.mouseDownTarget && this.mouseDownTarget === e.target && !e.target.closest(`.${this.options.modalContent}`) && !e.target.closest('.flatpickr-calendar')) {
      if (e.target.closest('.modal')?.classList.contains('_active')) {
        this.options.isClose && this.close(e);
      }
    }
    this.mouseDownTarget = null;
  }

  handleDocumentKeyUp(e) {
    if (e.key === 'Escape' && this.isOpen) {
      this.options.isClose && this.close();
    }
  }

  close() {
    if (!this.modalActive) return;
    this.isOpen = false;
    this.modalActive.classList.remove(this.options.classActive);
    this.modalActive = null;
    Modal.currentModalInstance = null
    this.enableScroll();
    this.onClose(this);
  }

  open(modalSelector, e) {
    if (!modalSelector) {
      if (this.options.unique) {
        this.modalActive = document.querySelector(`[data-special-modal="${this.options.unique}"]`)
      } else {
        console.error('Модальное окно не найдено, передайте селектор или укажите значение атрибута [data-special-modal]');
        return
      }
    } else {
      this.modalActive = document.querySelector(modalSelector);
    }

    if (!this.modalActive) {
      console.error('Модальное окно не найдено по данному селектору:', modalSelector);
      return;
    }

    // if (this.options.unique && this.options.unique !== this.modalActive.getAttribute('data-special-modal')) {
    //   return;
    // }

    // setTimeout(() => {
    this.modalActive.classList.add(this.options.classActive);
    this.disableScroll();

    this.isOpen = true;
    Modal.currentModalInstance = this
    if (this.options.unique && this.options.unique === this.modalActive.getAttribute('data-special-modal')) {
      this.onOpen(e);
    }
    // }, 0);
  }

  disableScroll() {
    const pagePos = window.scrollY;
    document.body.classList.add('_lock');
    document.body.dataset.position = pagePos;
  }

  enableScroll() {
    const pagePos = parseInt(document.body.dataset.position, 10);
    document.body.style.top = 'auto';
    document.body.classList.remove('_lock');
    window.scroll({ top: pagePos, left: 0 });
    document.body.removeAttribute('data-position');
  }

  lockPadding() {
    const paddingOffset = window.innerWidth - document.body.offsetWidth;
    this.modalActive.style.paddingRight = paddingOffset ? paddingOffset + 'px' : 'none';
    document.querySelector('.wrapper').style.paddingRight = paddingOffset + 'px';
  }

  unlockPadding() {
    this.modalActive.removeAttribute('style');
    document.querySelector('.wrapper').style.paddingRight = 0;
  }
}


export class ConfirmModal extends Modal {
  constructor(options) {
    super(options);
    let defaultoptions = {
      confirmButton: '.btn-yes',
      cancelButton: '.btn-no'
    }

    this.options = { ...this.options, ...Object.assign(defaultoptions, options) }

    this.confirmButton = this.modal.querySelector(this.options.confirmButton);
    this.cancelButton = this.modal.querySelector(this.options.cancelButton);

    this.buttonAction = () => { }
  }

  events() {
    super.events();
    this.modal.addEventListener('click', e => {
      if (e.target.closest(this.options.confirmButton)) {
        this.buttonAction(true, e)
      }
      if (e.target.closest(this.options.cancelButton)) {
        this.buttonAction(false, e)
      }
    })
  }
}
