import { createValidator } from "../../../settings/createValidator.js";

export function validate(form, options) {
  if (!form) return
  const validator = createValidator(form, options)

  validator.addField(form.querySelector('[name="promocode"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите промокод',
    },
    {
      rule: 'minLength',
      value: 3,
      errorMessage: 'Минимум 3 символа',
    },
  ]).addField(form.querySelector('[name="only_first_pay"]'), [
    {
      rule: 'required',
      errorMessage: 'Выберите вариант скидки',
    },
  ]).addField(form.querySelector('[name="deposit_included"]'), [
    {
      rule: 'required',
      errorMessage: 'Выберите вариант',
    },
  ]).addField(form.querySelector('[name="sales_type"]'), [
    {
      rule: 'required',
      errorMessage: 'Выберите тип скидки',
    },
  ]).addField(form.querySelector('[name="sale_value"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите значение',
    },
    {
      validator: value => {
        const numValue = parseFloat(value.replace(/[^0-9.,]/g, '').replace(',', '.'));
        return numValue > 0;
      },
      errorMessage: 'Значение должно быть больше 0',
    },
  ])

  return validator
}
