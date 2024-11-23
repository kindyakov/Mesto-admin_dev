import JustValidate from "just-validate";

export const createValidator = (form, options = {}) => {
  const validator = new JustValidate(form, {
    errorLabelStyle: {
      color: '#FF0505'
    },
    ...options
  })

  return validator
}