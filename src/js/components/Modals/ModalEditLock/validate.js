import { createValidator } from "../../../settings/createValidator.js";

export const validate = (form, options) => {
  const validator = createValidator(form, options);

  validator
    .addField(form.querySelector('input[name="lock_id"]'), [
      {
        rule: 'required',
        errorMessage: 'Обязательное поле',
      },
    ]);

  return validator;
};