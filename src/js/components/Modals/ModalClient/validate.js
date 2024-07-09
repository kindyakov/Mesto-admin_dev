import Inputmask from "inputmask";
import { createCalendar } from "../../../settings/createCalendar.js";
import { createValidator } from "../../../settings/createValidator.js";

const getMinDate = () => {
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return minDate;
};

export function validateClient(form, options) {
  if (!form) return
  const validator = createValidator(form, options)

  const inputBirthday = form.querySelector('input[name="birthday"]')
  inputBirthday.classList.add('input-client-birthday-modal')
  validator.calendarBirthday = createCalendar('.input-client-birthday-modal', {
    dateFormat: 'd.m.Y',
    maxDate: getMinDate()
  })

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
  ]).addField(form.querySelector('input[name="birthday"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите дату рождения',
    },
  ]).addField(form.querySelector('input[name="username"]'), [
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