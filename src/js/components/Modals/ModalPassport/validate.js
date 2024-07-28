import Inputmask from "inputmask";
import { createCalendar } from "../../../settings/createCalendar.js";
import { createValidator } from "../../../settings/createValidator.js";

export function validatePassport(form, options) {
  if (!form) return
  const validator = createValidator(form, options)

  const inputSeries = form.querySelector(`input[name="series"]`)
  const inputNo = form.querySelector(`input[name="no"]`)
  const inputSubdivision = form.querySelector(`input[name="subdivision"]`)
  Inputmask.default("9999").mask(inputSeries)
  Inputmask.default("999999").mask(inputNo)
  Inputmask.default("999-999").mask(inputSubdivision)

  validator.calendar = createCalendar(form.querySelector('input[name="issue_date"]'), {
    dateFormat: 'd.m.Y',
    appendTo: form.querySelector('input[name="issue_date"]').parentElement

  })

  validator.addField(form.querySelector('input[name="no"]'), [
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
  ]).addField(form.querySelector('input[name="series"]'), [
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
  ]).addField(form.querySelector('input[name="subdivision"]'), [
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