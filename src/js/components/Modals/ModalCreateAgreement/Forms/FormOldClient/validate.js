import { createCalendar } from "../../../../../settings/createCalendar.js";
import { createValidator } from "../../../../../settings/createValidator.js";

export function validate(form, options = {}) {
  if (!form) return null
  const validator = createValidator(form, options)

  const agrbegdate = createCalendar(form.querySelector('input[name="agrbegdate"]'), {
    dateFormat: 'd.m.Y',
    // appendTo: form.querySelector('input[name="agrbegdate"]').parentElement
  })

  const agrenddate = createCalendar(form.querySelector('input[name="agrenddate"]'), {
    dateFormat: 'd.m.Y',
    // appendTo: form.querySelector('input[name="agrenddate"]').parentElement
  })

  validator.calendars = [agrbegdate, agrenddate]

  validator.addField(form.querySelector('input[name="fullname"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите фио',
    },
    {
      rule: 'customRegexp',
      value: /^[А-ЯЁа-яё\s]+$/,
      errorMessage: 'Неверный формат',
    },
  ]).addField(form.querySelector('input[name="num_monthes"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      rule: 'number',
    }
  ]).addField(form.querySelector('input[name="agrbegdate"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
  ])

  return validator
}