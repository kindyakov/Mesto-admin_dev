import { createValidator } from "../../../settings/createValidator.js";

export const validate = (form) => {
  const validator = createValidator(form);

  validator
    .addField(form.querySelector('input[name="lock_num"]'), [
      {
        rule: 'required',
        errorMessage: 'Обязательное поле',
      },
      {
        rule: 'customRegexp',
        value: /^\d+$/,
        errorMessage: 'Только цифры',
      },
    ])
    .addField(form.querySelector('input[name="lock_id"]'), [
      {
        rule: 'required',
        errorMessage: 'Обязательное поле',
      },
      {
        rule: 'customRegexp',
        value: /^\d+$/,
        errorMessage: 'Только цифры',
      },
    ]);

  return validator;
};