import Inputmask from "inputmask";
import { createValidator } from "../../settings/createValidator.js";

export function validate(form, options) {
  if (!form) return
  const validator = createValidator(form, options)

  const inputPhone = form.querySelector('input[name="username"]')
  Inputmask.default("+7 (999) 999-99-99").mask(inputPhone)

  validator.addField(form.querySelector('input[name="username"]'), [
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
  ]).addField(form.querySelector('input[name="password"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите пароль',
    },
    {
      rule: 'minLength',
      value: 5,
      errorMessage: 'Пароль должен содержать минимум 5 символов',
    },
  ])

  return validator
}