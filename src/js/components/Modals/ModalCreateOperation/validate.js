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

  validator.addField(form.querySelector('[name="operation_date"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите дату операции',
    },
  ]).addField(form.querySelector('[name="category"]'), [
    {
      rule: 'required',
      errorMessage: 'Выберите категорию',
    },
  ]).addField(form.querySelector('[name="warehouse_id"]'), [
    {
      rule: 'required',
      errorMessage: 'Выберите склад',
    },
  ]).addField(form.querySelector('[name="subcategory"]'), [
    {
      rule: 'required',
      errorMessage: 'Выберите подкатегорию',
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