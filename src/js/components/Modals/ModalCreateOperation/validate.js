import datePicker from "../../../configs/datepicker.js";
import { createValidator } from "../../../settings/createValidator.js";

const getMinDate = () => {
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return minDate;
};

function formatPrice(value) {
  const sanitizedValue = value.replace(/[^-0-9]/g, '');
  let formattedValue = '';

  if (sanitizedValue.length) {
    for (let i = 0; i < sanitizedValue.length; i++) {
      if (i > 0 && (sanitizedValue.length - i) % 3 === 0) {
        formattedValue += ',';
      }
      formattedValue += sanitizedValue[i];
    }

    return formattedValue + ' ₽';
  } return ''
}

export function validate(form, options) {
  if (!form) return
  const validator = createValidator(form, options)

  const operationDate = form.querySelector('input[name="operation_date"]')

  const calendar = datePicker(operationDate, {
    dateFormat: 'dd.MM.yyyy',
    maxDate: new Date(),
    position: 'bottom left',
    autoClose: true,
    container: operationDate.parentElement
  })

  const inputAmount = form.querySelector('[name="amount"]')

  let previousValue = ''

  inputAmount.addEventListener('keydown', function (e) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      previousValue = previousValue.slice(0, -3);
      inputAmount.value = previousValue = formatPrice(previousValue)
    }
  });

  validator.calendars = [calendar]

  const categorySelect = form.querySelector('[name="category_select"]')
  const categoryInput = form.querySelector('[name="category_input"]')
  const subcategorySelect = form.querySelector('[name="subcategory_select"]')
  const subcategoryInput = form.querySelector('[name="subcategory_input"]')

  validator.addField(form.querySelector('[name="operation_date"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите дату операции',
    },
  ]).addField(categorySelect, [
    {
      validator: () => {
        const selectValue = categorySelect.value
        const inputValue = categoryInput?.value?.trim()
        return selectValue === 'new_category' ? !!inputValue : !!selectValue
      },
      errorMessage: 'Выберите или введите категорию',
    },
  ]).addField(form.querySelector('[name="warehouse_id"]'), [
    {
      rule: 'required',
      errorMessage: 'Выберите склад',
    },
  ]).addField(subcategorySelect, [
    {
      validator: () => {
        // Если выбрана новая категория, подкатегория необязательна
        if (categorySelect.value === 'new_category') {
          return true
        }
        
        const selectValue = subcategorySelect.value
        const inputValue = subcategoryInput?.value?.trim()
        return selectValue === 'new_subcategory' ? !!inputValue : !!selectValue
      },
      errorMessage: 'Выберите или введите подкатегорию',
    },
  ]).addField(form.querySelector('[name="amount"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите сумму',
    },
    {
      validator: value => {
        let formattedValue = formatPrice(value)
        inputAmount.value = previousValue = formattedValue
        return parseFloat(formattedValue.replace(/[^0-9]/g, '')) > 0
      },
      errorMessage: 'Неверный формат суммы',
    },
  ])

  return validator
}