import Inputmask from "inputmask";
import { createCalendar } from "../../../../../settings/createCalendar.js";
import { createValidator } from "../../../../../settings/createValidator.js";

export function validate(form, options = {}) {
  if (!form) return null
  const validator = createValidator(form, options)

  const agrbegdate = createCalendar(form.querySelector('input[name="agrbegdate"]'), {
    dateFormat: 'd.m.Y',
  })

  const agrenddate = createCalendar(form.querySelector('input[name="agrenddate"]'), {
    dateFormat: 'd.m.Y',
  })

  const inputPhone = form.querySelector('input[name="username"]')
  Inputmask.default("+7 (999) 999-99-99").mask(inputPhone)

  validator.calendars = [agrbegdate, agrenddate]

  const inputBik = form.querySelector('input[name="bik"]')
  const inputInn = form.querySelector('input[name="inn"]')
  const inputKpp = form.querySelector('input[name="kpp"]')
  const inputBank = form.querySelector('input[name="bank"]')
  const inputRs = form.querySelector('input[name="rs"]')
  const inputKs = form.querySelector('input[name="ks"]')

  validator.addField(form.querySelector('input[name="agrid"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      rule: 'number',
    }
  ]).addField(form.querySelector('input[name="price"]'), [
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
  ]).addField(form.querySelector('input[name="agrenddate"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
  ]).addField(form.querySelector('input[name="equipment_price"]'), [
    {
      rule: 'number',
    }
  ]).addField(form.querySelector('input[name="fullname"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
  ]).addField(form.querySelector('input[name="inn"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      validator: (value, data) => {
        if (value.length > 12) {
          inputInn.value = value.slice(0, 12)
        } else {
          inputInn.value = value.replace(/[^0-9]/g, '')
        }
        let l = inputInn.value.replace(/[^0-9]/g, '').length
        return 10 <= l && l <= 12
      },
      errorMessage: 'Неверный формат',
    }
  ]).addField(form.querySelector('input[name="address"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
  ]).addField(form.querySelector('input[name="kpp"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      validator: value => {
        if (value.length > 9) {
          inputKpp.value = value.slice(0, 9)
        } else {
          inputKpp.value = value.replace(/[^0-9]/g, '')
        }
        return inputKpp.value.replace(/[^0-9]/g, '').length === 9
      },
      errorMessage: 'Неверный формат',
    }
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
  ]).addField(form.querySelector('input[name="bank"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
  ]).addField(form.querySelector('input[name="rs"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      validator: value => {
        if (value.length > 20) {
          inputRs.value = value.slice(0, 20)
        } else {
          inputRs.value = value.replace(/[^0-9]/g, '')
        }
        return inputRs.value.replace(/[^0-9]/g, '').length === 20
      },
      errorMessage: 'Неверный формат',
    }
  ]).addField(form.querySelector('input[name="bik"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      validator: value => {
        if (value.length > 9) {
          inputBik.value = value.slice(0, 9)
        } else {
          inputBik.value = value.replace(/[^0-9]/g, '')
        }
        return inputBik.value.replace(/[^0-9]/g, '').length === 9
      },
      errorMessage: 'Неверный формат',
    }
  ]).addField(form.querySelector('input[name="ks"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      validator: value => {
        if (value.length > 20) {
          inputKs.value = value.slice(0, 20)
        } else {
          inputKs.value = value.replace(/[^0-9]/g, '')
        }
        return inputKs.value.replace(/[^0-9]/g, '').length === 20
      },
      errorMessage: 'Неверный формат',
    }
  ])

  return validator
}