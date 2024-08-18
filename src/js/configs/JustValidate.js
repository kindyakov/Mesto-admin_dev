import JustValidate from "just-validate";

const justValidate = (form, options) => {
  const validator = new JustValidate(form, {
    errorLabelStyle: {
      color: '#FF0505'
    },
    ...options
  })

  return validator
}

export default justValidate