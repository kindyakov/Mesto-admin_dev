import { createCalendar } from "../../../settings/createCalendar.js";
import { createValidator } from "../../../settings/createValidator.js";

export function validate(form, options) {
  if (!form) return
  const validator = createValidator(form, options)

  const leavedDate = form.querySelector('input[name="leave_date"]')

  const calendar = createCalendar(leavedDate, {
    dateFormat: 'd.m.Y',
    appendTo: leavedDate.parentElement
  })

  validator.calendars = [calendar]

  validator.addField(leavedDate, [
    {
      rule: 'required',
      errorMessage: 'Введите завершения аренды',
    },
  ])

  return validator
}