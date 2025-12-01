import content from './modal-content.html'
import { formattingPrice } from '../../../utils/formattingPrice.js';

class EditEffectivenessUtils {
  constructor(wrapper, editedValues, onSaveCallback) {
    this.wrapper = wrapper;
    this.editedValues = editedValues;
    this.onSaveCallback = onSaveCallback;
    this.init();
  }

  init() {
    this.initEditButtons();
  }

  initEditButtons() {
    const editButtons = this.wrapper.querySelectorAll('[data-edit-btn]');

    editButtons.length && editButtons.forEach(btn => {
      if (btn.classList.contains('initialized')) {
        return
      } else {
        btn.classList.add('initialized');
      }
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const editKey = btn.dataset.editBtn;
        // Находим родительский контейнер с классами flex items-center gap-1.5
        const parentContainer = btn.parentElement;
        const valueElement = parentContainer?.querySelector('[data-render-widget]');

        if (valueElement) {
          this.openEditModal(valueElement, editKey);
        }
      });
    });
  }

  openEditModal(valueElement, editKey) {
    // Сохраняем оригинальное значение для сравнения
    const originalValue = valueElement.textContent.trim();

    // Используем сохраненное значение, если оно есть, иначе текущее значение из элемента
    const savedValue = this.editedValues[editKey];
    const currentDisplayValue = savedValue !== undefined
      ? formattingPrice(savedValue)
      : originalValue;

    const modal = new tingle.modal({
      footer: false,
      stickyFooter: false,
      closeMethods: ['overlay', 'button', 'escape'],
      closeLabel: "Закрыть"
    });

    modal.setContent(content);
    modal.open();

    // Получаем элементы после открытия модала
    const input = modal.modal.querySelector('#editInput');
    const saveBtn = modal.modal.querySelector('#saveBtn');
    const cancelBtn = modal.modal.querySelector('#cancelBtn');
    const errorDiv = modal.modal.querySelector('#errorMessage');

    // Извлекаем числовое значение из отформатированной строки (убираем пробелы, ₽ и другие символы)
    // Если есть сохраненное значение, используем его, иначе парсим из текста
    const numericValue = savedValue !== undefined
      ? savedValue.toString()
      : this.formatNumberForEdit(currentDisplayValue);
    input.value = numericValue;

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
        this.handleSave(input, valueElement, editKey, modal, errorDiv, originalValue);
      }
    });

    // Обработчики кнопок
    saveBtn.addEventListener('click', () => {
      this.handleSave(input, valueElement, editKey, modal, errorDiv, originalValue);
    });

    cancelBtn.addEventListener('click', () => {
      modal.close();
    });
  }

  handleSave(input, valueElement, editKey, modal, errorDiv, originalValue) {
    const newValue = input.value.trim();

    if (!newValue) {
      this.showError(errorDiv, 'Значение не может быть пустым');
      input.focus();
      return;
    }

    const numericValue = parseInt(newValue, 10);
    // Сравниваем с сохраненным значением, если оно есть, иначе с оригинальным
    const savedValue = this.editedValues[editKey];
    const originalNumericValue = savedValue !== undefined
      ? savedValue
      : parseInt(this.formatNumberForEdit(originalValue), 10);

    if (numericValue === originalNumericValue) {
      modal.close();
      return;
    }

    // Сохраняем значение в объект
    this.editedValues[editKey] = numericValue;

    // Обновляем отображение
    const formattedValue = formattingPrice(numericValue);
    valueElement.textContent = formattedValue;
    modal.close();

    // Вызываем callback для обновления виджетов
    if (this.onSaveCallback) {
      this.onSaveCallback();
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
    // Убираем все нецифровые символы (пробелы, ₽, запятые и т.д.)
    return value.replace(/[^\d]/g, '');
  }

  showError(errorDiv, message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
  }

  hideError(errorDiv) {
    errorDiv.classList.add('hidden');
  }
}

export default EditEffectivenessUtils;
