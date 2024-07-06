import JustValidate from "just-validate";
import Inputmask from "inputmask";

export function validate(form) {
  if (!form) return
  const validator = new JustValidate(form, {
    errorLabelStyle: {
      color: '#FF0505'
    }
  });

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