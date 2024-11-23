import BaseModal from "../BaseModal.js"
import content from './content.html'
import { FormOldClient } from "./Forms/FormOldClient/FormOldClient.js"
import { FormFClient } from "./Forms/FormFClient/FormFClient.js"
import { FormUClient } from "./Forms/FormUClient/FormUClient.js"

class ModalCreateAgreement extends BaseModal {
  constructor(steps, options = {}) {
    super(content, {
      cssClass: ['modal-create-agreement'],
      ...options
    })

    this.container = this.modalBody.querySelector('.modal__rendering')
    this.contentElement = this.container.querySelector('.modal__rendering_content');
    this.childrenEl = Array.from(this.contentElement.children)
    this.buttonBack = this.container.querySelector('.button-back')
    this.steps = steps; // Объект или массив с этапами    
    this.step = 0; // Текущий этап
    this.state = {}; // Состояние выбранных данных
    this.cache = {}

    this.formOldClient = new FormOldClient(this.modalBody, this.loader)
    this.formFClient = new FormFClient(this.modalBody, this.loader)
    this.formUClient = new FormUClient(this.modalBody, this.loader)
  }

  onOpen() {
    this.calcHeight(this.contentElement.children[0])
  }

  onClose() {
    this.step = 0
    this.renderStep(this.childrenEl[this.step]);
    this.formOldClient.reset()
    this.formFClient.reset()
    this.formUClient.reset()
  }

  onHandleClick({ target }) {
    if (target.closest('.select-btn')) {
      const btn = target.closest('.select-btn')
      const nextContent = this.contentElement.querySelector(this.steps[btn.dataset.value])
      this.renderStep(nextContent)
    }

    if (target.closest('.button-back')) {
      const prevContent = this.childrenEl.slice(0, this.step).reverse().find(el => el.classList.contains('button-container'))
      this.renderStep(prevContent)
    }
  }

  calcHeight(nextContent) {
    const height = Math.max(nextContent.clientHeight, nextContent.offsetHeight, nextContent.scrollHeight)
    this.contentElement.style.height = height + 'px'
  }

  // Отображение этапа
  renderStep(nextContent) {
    this.step = this.childrenEl.findIndex(el => el == nextContent);

    this.childrenEl.forEach(el => el.classList.add('_none'));

    nextContent.classList.remove('_none')

    if (this.step) {
      this.buttonBack.classList.remove('_none')
    } else {
      this.buttonBack.classList.add('_none')
    }

    this.calcHeight(nextContent)
  }

  // Возврат на предыдущий этап
  goBack() {
    if (this.step > 0) {
      delete this.state[`step_${this.step}`]; // Удалить текущий выбор
      this.step--;
      this.renderStep();
    }
  }
}


const steps = {
  old_client: '.form-old-client',
  new_client: '.button-container-2',
  f: '.form-f-client',
  u: '.form-u-client',
}

const modalCreateAgreement = new ModalCreateAgreement(steps)

export default modalCreateAgreement