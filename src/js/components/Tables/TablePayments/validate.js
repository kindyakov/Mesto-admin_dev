import { createValidator } from "../../../settings/createValidator.js";
import { createCalendar } from "../../../settings/createCalendar.js";

export function validateRow(form, options = {}) {
  if (!form) return
  const validator = createValidator(form, options)
  const paymentDateCalendar = createCalendar(options.inputsObj.payment_date, {
    dateFormat: 'd.m.Y',
  })

  validator.addField(form.querySelector('input[name="payment_date"]'), [
    {
      rule: 'required',
    },
  ]).addField(form.querySelector('input[name="amount"]'), [
    {
      rule: 'required',
    },
    {
      validator: (value, obj) => {
        const input = obj[2].elem
        input.value = value.replace(/[^0-9]/g, '')
        return Number.isInteger(+input.value)
      },
    }
  ]).addField(form.querySelector('input[name="fullname"]'), [
    {
      rule: 'required',
    },
    {
      rule: 'customRegexp',
      value: /^[А-ЯЁа-яё\s]+$/,
      errorMessage: 'Неверный формат',
    },
  ]).addField(form.querySelector('input[name="agrid"]'), [
    {
      rule: 'required',
    },
    {
      validator: (value, obj) => {
        const input = obj[4].elem
        input.value = value.replace(/[^0-9]/g, '')
        return Number.isInteger(+input.value)
      },
    }
  ])

  validator.onDestroy = () => {
    paymentDateCalendar.destroy()
  }

  return validator
}
