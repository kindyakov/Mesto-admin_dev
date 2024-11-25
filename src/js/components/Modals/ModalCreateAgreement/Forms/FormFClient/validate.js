import Inputmask from "inputmask";
import { createCalendar } from "../../../../../settings/createCalendar.js";
import { createValidator } from "../../../../../settings/createValidator.js";

export function validate(form, options = {}) {
  if (!form) return null
  const validator = createValidator(form, options)

  const agrbegdate = createCalendar(form.querySelector('input[name="agrbegdate"]'), {
    dateFormat: 'd.m.Y',
    appendTo: form.querySelector('input[name="agrbegdate"]').parentElement
  })

  const birthday = createCalendar(form.querySelector('input[name="birthday"]'), {
    dateFormat: 'd.m.Y',
    appendTo: form.querySelector('input[name="birthday"]').parentElement
  })

  const issue_date = createCalendar(form.querySelector('input[name="issue_date"]'), {
    dateFormat: 'd.m.Y',
    appendTo: form.querySelector('input[name="issue_date"]').parentElement
  })

  const inputPhone = form.querySelector('input[name="username"]')
  Inputmask.default("+7 (999) 999-99-99").mask(inputPhone)

  const inputSeries = form.querySelector(`input[name="series"]`)
  const inputNo = form.querySelector(`input[name="no"]`)
  const inputSubdivision = form.querySelector(`input[name="subdivision"]`)
  Inputmask.default("9999").mask(inputSeries)
  Inputmask.default("999999").mask(inputNo)
  Inputmask.default("999-999").mask(inputSubdivision)

  validator.calendars = [agrbegdate, birthday, issue_date]

  validator.addField(form.querySelector('input[name="num_monthes"]'), [
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
  ]).addField(form.querySelector('input[name="familyname"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      rule: 'customRegexp',
      value: /^[А-ЯЁа-яё\s]+$/,
      errorMessage: 'Неверный формат',
    },
  ]).addField(form.querySelector('input[name="firstname"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      rule: 'customRegexp',
      value: /^[А-ЯЁа-яё\s]+$/,
      errorMessage: 'Неверный формат',
    }
  ]).addField(form.querySelector('input[name="patronymic"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      rule: 'customRegexp',
      value: /^[А-ЯЁа-яё\s]+$/,
      errorMessage: 'Неверный формат',
    }
  ]).addField(form.querySelector('input[name="birthday"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
  ]).addField(inputPhone, [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
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
      errorMessage: 'Заполните поле',
    },
    {
      rule: 'email',
    }
  ]).addField(form.querySelector('input[name="address"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
  ]).addField(inputNo, [
    {
      rule: 'required',
      errorMessage: 'Введите номер',
    },
    {
      validator: value => {
        const unmaskInput = Inputmask.default.unmask(value, { mask: "999999" });
        return Boolean(Number(unmaskInput) && unmaskInput.length === 6)
      },
      errorMessage: 'Неверный формат',
    }
  ]).addField(inputSeries, [
    {
      rule: 'required',
      errorMessage: 'Введите серию',
    },
    {
      validator: value => {
        const unmaskInput = Inputmask.default.unmask(value, { mask: "9999" });
        return Boolean(Number(unmaskInput) && unmaskInput.length === 4)
      },
      errorMessage: 'Неверный формат',
    }
  ]).addField(form.querySelector('input[name="issued_by"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите кем был выдан паспорт',
    },
  ]).addField(form.querySelector('input[name="issue_date"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите дату выдачи',
    },
  ]).addField(inputSubdivision, [
    {
      rule: 'required',
      errorMessage: 'Введите код',
    },
    {
      validator: value => {
        const unmaskInput = Inputmask.default.unmask(value, { mask: "999-999" });
        return Boolean(Number(unmaskInput) && unmaskInput.length === 6)
      },
      errorMessage: 'Неверный формат',
    }
  ])

  return validator
}