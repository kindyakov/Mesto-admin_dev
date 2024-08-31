import { Loader } from "../../modules/myLoader.js";
import { outputInfo } from "../../utils/outputinfo.js";
import { dateFormatter } from "../../settings/dateFormatter.js";

// Базовый класс для модального окна
class BaseModal {
  constructor(content, options) {
    const mergerOptions = Object.assign({
      footer: false,
      closeMethods: ['overlay', 'button', 'escape'],
      closeLabel: "Close",
      cssClass: ['custom-modal'],
    }, options)

    this.modal = new tingle.modal({
      ...mergerOptions,
      onOpen: this.onOpen.bind(this),
      onClose: this.onClose.bind(this),
      beforeClose: this.beforeClose.bind(this),
    });

    this.app = window.app

    // this.app.notify.show(response.data)
    this.form = null
    this.isEdit = false
    this.isSend = false
    this.enablePhotoUpload = options.enablePhotoUpload || false

    this.setContent(content);
  }

  onOpen() {
  }

  onClose() {
    this.disableEditInput(this.form, [
      { el: this.modalBody.querySelector('.btn-edit-data'), delClass: '_is-edit' }
    ])
  }

  onSave() {
  }

  onEdit() {
    return {}
  }

  checkValue() {
    const inputs = this.form.querySelectorAll('input')
    let isValue = false
    inputs.length && inputs.forEach(input => {
      if (input.value !== '') {
        isValue = true
      }
    })
    return isValue
  }

  beforeClose() {
    if (this.isEdit) {
      outputInfo({
        msg: 'У вас есть несохраненные изменения.</br>Вы уверены, что хотите закрыть окно?',
        msg_type: 'warning',
        isConfirm: true
      }, isConfirm => {
        if (isConfirm) {
          this.isEdit = false
          this.close()
          if (this.nextModal) {
            this.nextModal?.modalInstance.open(this.nextModal.button)
          }
        }
      });

      return false;
    } else {
      return true;
    }
  }

  setContent(content) {
    this.modal.setContent(content);
    this.modalBody = this.modal.modal.querySelector('.modal__body')
    this.loader = new Loader(this.modalBody)
    const closeButton = this.modal.modal.querySelector('.tingle-modal__close')

    if (closeButton) {
      closeButton.remove();
    }

    if (this.enablePhotoUpload) {
      this.btnOpenPrevModal = this.modalBody.querySelector('.btn-open-prev-modal')
      this.isSendFile = false;
      this.file = null;
      this.initPhotoUpload();
    }

    this.modalBody.addEventListener('click', e => {
      const button = e.target.closest('[data-modal]');

      if (button && button.getAttribute('data-modal')) {
        this.close()
      }

      if (e.target.closest('.btn-edit-data')) {
        this.handleClickEdit(e)
      }
    })
  }

  initPhotoUpload() {
    this.inputFile = this.modalBody.querySelector('.input-file');
    this.label = this.modalBody.querySelector('.modal__upload_lable');
    this.img = this.modalBody.querySelector('.img');
    this.btnSave = this.modalBody.querySelector('.btn-save');
    this.acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    this.initPhotoEvents();
  }

  initPhotoEvents() {
    this.label.addEventListener('dragover', this.onDragOver.bind(this));
    this.label.addEventListener('dragleave', this.onDragLeave.bind(this));
    this.label.addEventListener('drop', this.onDrop.bind(this));
    this.inputFile.addEventListener('change', this.onFileChange.bind(this));
    this.btnSave.addEventListener('click', this.onSave.bind(this));
  }

  onDragOver(event) {
    event.preventDefault();
    this.label.classList.add('_is-drag');
  }

  onDragLeave() {
    this.label.classList.remove('_is-drag');
  }

  onDrop(event) {
    event.preventDefault();
    this.label.classList.remove('_is-drag');
    const file = event.dataTransfer.files[0];
    this.handleFile(file);
  }

  onFileChange() {
    const file = this.inputFile.files[0];
    this.handleFile(file);
  }

  handleFile(file) {
    if (file && this.acceptedTypes.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.img.src = e.target.result;
      };
      reader.readAsDataURL(file);
      this.file = file;

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      this.inputFile.files = dataTransfer.files;

      this.label.classList.add('_is-load');
      this.label.classList.remove('_error');
    } else {
      this.label.classList.add('_error');
    }
  }

  handleClickEdit(e) {
    const btn = e.target.closest('.btn-edit-data')
    if (btn.classList.contains('_is-edit')) {
      this.validator?.revalidate().then(isValid => {
        if (isValid) {
          const reqData = this.onEdit()

          this.editForm(reqData).finally(() => {
            btn.classList.remove('_is-edit')
            this.isEdit = false
            this.disableEditInput(this.form)
          })
        }
      })
    } else {
      btn.classList.add('_is-edit')
      this.isEdit = true
      this.enableEditInput(this.form)
    }
  }

  enableEditInput(form = null) {
    if (!form) return
    const inputs = form.querySelectorAll('input')
    inputs.length && inputs.forEach(input => {
      input.removeAttribute('readonly')
      input.classList.add('edit')
      input.classList.remove('not-edit')
    })

    this.selects?.selectsCustom?.forEach(select => select.classList.remove('_disabled'))
    this.validator?.calendars?.forEach(calendar => {
      calendar.input.value && calendar.setDate(new Date(dateFormatter(calendar.input.value, 'yyyy-MM-dd')))
      calendar.set('clickOpens', true)
    })
  }

  disableEditInput(form = null, arr = [
    { el: this.modalBody.querySelector('.btn-edit-data'), delClass: '_is-edit' }
  ]) {
    if (form) {
      const inputs = form.querySelectorAll('input')

      inputs.length && inputs.forEach(input => {
        input.setAttribute('readonly', 'true')
        input.classList.remove('edit')
        input.classList.add('not-edit')
      })

      if (this.modalBody.querySelector('.btn-edit-data')) {
        this.selects?.selectsCustom?.forEach(select => select.classList.add('_disabled'))
        this.validator?.calendars?.forEach(calendar => calendar.set('clickOpens', false))
      }
    }

    if (arr.length) {
      arr.forEach(obj => obj.el?.classList.remove(obj.delClass))
    }
  }

  open(button = null) {
    this.modal.open()
    if (button) {
      this.onOpen(button)
    }
  }

  close() {
    this.modal.close();
  }

  extractData(params) {
    const isElement = (params instanceof Element);
    const isObject = (params && typeof params === 'object' && !Array.isArray(params) && params !== null && !(params instanceof Element));
    if (!isElement && !isObject) return null
    return isElement ? JSON.parse(params.getAttribute('data-json')) : params
  }

  async getData(id) {
    return {}
  }

  async editForm() {

  }
}

export default BaseModal