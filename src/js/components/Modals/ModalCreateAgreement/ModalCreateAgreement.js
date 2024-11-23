import { createElement } from "../../../settings/createElement.js";
import BaseModal from "../BaseModal.js"
import content from './content.html'

class ModalCreateAgreement extends BaseModal {
  constructor(steps, options = {}) {
    super(content, {
      cssClass: ['modal-create-agreement'],
      ...options
    })

    this.container = this.modalBody.querySelector('.modal__rendering')
    this.contentElement = this.container.querySelector('.modal__rendering_content');

    this.steps = steps; // Объект или массив с этапами
    this.step = { i: 0, params: null }; // Текущий этап
    this.state = {}; // Состояние выбранных данных
    this.cache = {}
    // this.renderStep();
  }

  onOpen() {
  }

  onClose() {
    this.step.i = 0
    this.renderStep();
  }

  onHandleClick({ target }) {
    return
    if (target.closest('.select-btn')) {
      const btn = target.closest('.select-btn')

      this.state[`${this.step.i}`] = btn.dataset.value;
      this.step.i++;

      if (this.step.i < this.steps.length - 1) {
        this.renderStep();
      } else {
        this.renderFinalContent();
      }
    }
  }

  // Отображение этапа
  renderStep() {
    const step = this.steps[this.step.i];
    this.contentElement.style.opacity = 0;

    setTimeout(() => {
      this.contentElement.innerHTML = ``;

      if (!this.cache[this.step.i]) {
        const content = step.render({ api: this, ...step })
        this.cache[this.step.i] = content
      }

      this.contentElement.appendChild(this.cache[this.step.i]);
      this.contentElement.style.opacity = 1;
    }, 300);
  }

  // Возврат на предыдущий этап
  goBack() {
    if (this.step.i > 0) {
      delete this.state[`step_${this.step.i}`]; // Удалить текущий выбор
      this.step.i--;
      this.renderStep();
    }
  }

  renderButtons(options, onClick = () => { }) {
    const buttonContainer = createElement('div', { attributes: [['style', 'display:flex;gap:20px;width:100%;']] });

    options.length && options.forEach(({ classes, content, value }) => {
      const button = createElement('button', { classes, content, attributes: [['data-value', value], ['style', 'flex: 1 1 auto;']] })
      buttonContainer.appendChild(button);
      button.addEventListener('click', () => onClick({ classes, content, value }))
    })

    return buttonContainer
  }

  // Отображение финального контента
  renderFinalContent() {
    const combination = Object.values(this.state).join(','); // Сборка ключа
    const finalContent = this.steps[this.step.i].finalContent[combination] || 'Нет данных для выбранной комбинации.';

    this.contentElement.style.opacity = 0;

    setTimeout(() => {
      this.contentElement.innerHTML = `<h3>Результат</h3><p>${finalContent}</p>`;
      this.contentElement.style.opacity = 1;
    }, 300);
  }
}

const steps = [
  {
    options: [
      { content: 'Старый клиент', value: 'old_client', classes: ['button', 'select-btn'] },
      { content: 'Новый клиент', value: 'new_client', classes: ['button', 'select-btn'] }
    ],
    render({ api, ...params }) {
      return api.renderButtons(params.options, ({ value }) => {
        if (value == 'old_client') {
          api.step.params = 'old_client'
        }
      })
    }
  },
  {
    old_client: {},
    new_client: [
      { content: 'Физическое лицо', value: 'f', classes: ['button', 'select-btn'] },
      { content: 'Юридическое лицо', value: 'u', classes: ['button', 'select-btn'] }
    ],
    render({ api, options }) {
      let content = null
      if ('') {
        content = api.renderButtons(options, ({ value }) => {
          if (value == 'old_client') {
            api.step.params = 'old_client'

          }
        })
      }
    }
  },
  {
    finalContent: {
      'old_client,f': 'Вы выбрали: Старый клиент - Физическое лицо.',
      'old_client,u': 'Вы выбрали: Старый клиент - Юридическое лицо.',
      'new_client,f': 'Вы выбрали: Новый клиент - Физическое лицо.',
      'new_client,u': 'Вы выбрали: Новый клиент - Юридическое лицо.'
    }
  }
]

const obj = {
  old_client: '.form-old-client',
  new_client: '.button-container-2',
  f: '.form-f-client',
  u: '.form-u-client',
}

const modalCreateAgreement = new ModalCreateAgreement(steps)

export default modalCreateAgreement