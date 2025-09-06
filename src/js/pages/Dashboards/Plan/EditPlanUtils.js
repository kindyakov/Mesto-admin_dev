import { api } from '../../../settings/api.js';
import content from './modal-content.html'
import { Loader } from '../../../modules/myLoader.js';

class EditPlanUtils {
  constructor(wrapper, date) {
    this.wrapper = wrapper;
    this.loader = null;
    this.date = date;
    this.init();
  }

  init() {
    this.initEditButtons();
  }

  initEditButtons() {
    const editButtons = this.wrapper.querySelectorAll('.edit-plan-btn');

    editButtons.length && editButtons.forEach(btn => {
      if (btn.classList.contains('initialized')) {
        return
      } else {
        btn.classList.add('initialized');
      }
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const editKey = btn.dataset.editBtn;
        const valueSpan = this.wrapper.querySelector(`[data-edit-value="${editKey}"]`);

        if (valueSpan) {
          this.openEditModal(valueSpan, editKey);
        }
      });
    });
  }

  openEditModal(valueSpan, editKey) {
    const currentValue = valueSpan.textContent.trim();
    const modal = new tingle.modal({
      footer: false,
      stickyFooter: false,
      closeMethods: ['overlay', 'button', 'escape'],
      closeLabel: "Закрыть"
    });

    modal.setContent(content);
    modal.open();

    this.loader = new Loader(modal.modal.querySelector('.modal__body'));

    // Получаем элементы после открытия модала
    const input = modal.modal.querySelector('#editInput');
    const saveBtn = modal.modal.querySelector('#saveBtn');
    const cancelBtn = modal.modal.querySelector('#cancelBtn');
    const errorDiv = modal.modal.querySelector('#errorMessage');

    // Фокус и выделение текста
    setTimeout(() => {
      input.focus();
      input.select();
    }, 100);

    // Валидация ввода
    input.addEventListener('input', (e) => {
      this.validateNumberInput(e);
      this.hideError(errorDiv);
    });

    // Обработка Enter
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleSave(input, valueSpan, editKey, modal, errorDiv, currentValue);
      }
    });

    // Обработчики кнопок
    saveBtn.addEventListener('click', () => {
      this.handleSave(input, valueSpan, editKey, modal, errorDiv, currentValue);
    });

    cancelBtn.addEventListener('click', () => {
      modal.close();
    });
  }

  async handleSave(input, valueSpan, editKey, modal, errorDiv, originalValue) {
    const newValue = input.value.trim();

    if (!newValue) {
      this.showError(errorDiv, 'Значение не может быть пустым');
      input.focus();
      return;
    }

    if (newValue === this.formatNumberForEdit(originalValue)) {
      modal.close();
      return;
    }

    try {
      const data = {
        warehouse_id: window.app?.warehouse?.warehouse_id || null,
        [editKey]: parseInt(newValue, 10),
        month_or_day: 'month',
        data: this.date
      };

      await this.setFinancePlan(data);

      const formattedValue = this.formatNumberForDisplay(newValue);
      valueSpan.textContent = formattedValue;
      modal.close();
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      this.showError(errorDiv, 'Ошибка при сохранении. Попробуйте еще раз.');
      input.focus();
    }
  }

  validateNumberInput(e) {
    let value = e.target.value;
    value = value.replace(/[^\d]/g, '');

    if (value.length > 12) {
      value = value.substring(0, 12);
    }

    e.target.value = value;
  }

  formatNumberForEdit(value) {
    return value.replace(/\s/g, '');
  }

  formatNumberForDisplay(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  showError(errorDiv, message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
  }

  hideError(errorDiv) {
    errorDiv.classList.add('hidden');
  }

  async setFinancePlan(data) {
    try {
      this.loader.enable();
      console.log(data)

      const response = await api.post('/_set_finance_plan_', data);
      if (response.status !== 200) {
        throw new Error('Ошибка сервера');
      }
      if (response.data && window.app?.notify?.show) {
        window.app.notify.show(response.data);
      }
    } catch (error) {
      throw error;
    } finally {
      this.loader.disable();
    }
  }
}

export default EditPlanUtils;