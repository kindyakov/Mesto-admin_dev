import Inputmask from "inputmask";
import { createValidator } from "../../../settings/createValidator.js";

export function validateRow(form, options = {}) {
  if (!form) return
  const validator = createValidator(form, options)

  const inputPhone = form.querySelector('input[name="username"]')
  Inputmask.default("+7 (999) 999-99-99").mask(inputPhone)

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
  ]).addField(inputPhone, [
    {
      rule: 'required',
      errorMessage: 'Введите телефон',
    },
    {
      validator: value => {
        const unmaskPhone = Inputmask.default.unmask(value, { mask: "+7 (999) 999-99-99" });
        return Boolean(Number(unmaskPhone) && unmaskPhone.length === 10)
      },
      errorMessage: 'Неверный формат',
    }
  ]).addField(form.querySelector('input[name="email"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите почту',
    },
    {
      rule: 'email',
      errorMessage: 'Неверный формат',
    }
  ])

  return validator
}
