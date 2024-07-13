import Inputmask from "inputmask";
import { createCalendar } from "../../../settings/createCalendar.js";
import { createValidator } from "../../../settings/createValidator.js";

export function validate(form, options) {
  if (!form) return
  const validator = createValidator(form, options)

  const agrbegdate = form.querySelector('input[name="datearrival"]')

  const calendar = createCalendar(agrbegdate, {
    dateFormat: 'd.m.Y',
  })

  validator.calendars = [calendar]

  const inputPhone = form.querySelector('input[name="username"]')
  Inputmask.default("+7 (999) 999-99-99").mask(inputPhone)

  validator.addField(form.querySelector('input[name="fullname"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите фио',
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
  ]).addField(form.querySelector('[name="datearrival"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите дату заезда',
    },
  ])

  return validator
}