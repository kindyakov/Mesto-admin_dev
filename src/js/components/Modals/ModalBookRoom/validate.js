import Inputmask from "inputmask";
import { createValidator } from "../../../settings/createValidator.js";

export function validate(form, options) {
  if (!form) return
  const validator = createValidator(form, options)

  const agrbegdate = form.querySelector('input[name="datearrival"]')


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
  ]).addField(form.querySelector('input[name="username"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите телефон',
    },
  ]).addField(form.querySelector('input[name="email"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите почту',
    },
  ])

  return validator
}