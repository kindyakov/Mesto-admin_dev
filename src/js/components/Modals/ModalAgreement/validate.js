import { createCalendar } from "../../../settings/createCalendar.js";
import { createValidator } from "../../../settings/createValidator.js";

const getMinDate = () => {
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return minDate;
};

export function validate(form, options) {
  if (!form) return
  const validator = createValidator(form, options)

  const agrbegdate = form.querySelector('input[name="agrbegdate"]')
  const agrplanenddate = form.querySelector('input[name="agrplanenddate"]')
  const agrenddate = form.querySelector('input[name="agrenddate"]')

  const calendarAgrBegDate = createCalendar(agrbegdate, {
    dateFormat: 'd.m.Y',
  })
  calendarAgrBegDate.setDate(agrbegdate.value, true, "d.m.Y");

  const calendarAgrPlanEndDate = createCalendar(agrplanenddate, {
    dateFormat: 'd.m.Y',
  })
  calendarAgrPlanEndDate.setDate(agrplanenddate.value, true, "d.m.Y");

  const calendarAgrEndDate = createCalendar(agrenddate, {
    dateFormat: 'd.m.Y',
  })
  calendarAgrEndDate.setDate(agrenddate.value, true, "d.m.Y");

  validator.calendars = [calendarAgrBegDate, calendarAgrPlanEndDate, calendarAgrEndDate]
  validator.calendars.forEach(calendar => calendar.set('clickOpens', false))

  validator.addField(form.querySelector('input[name="fullname"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите фио',
    },
    {
      rule: 'customRegexp',
      value: /^[А-ЯЁа-яё\s]+$/,
      errorMessage: 'Неверный формат',
    },
  ]).addField(form.querySelector('input[name="manager_name"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите менеджера',
    },
  ]).addField(agrbegdate, [
    {
      rule: 'required',
      errorMessage: 'Введите дату',
    },
  ]).addField(agrplanenddate, [
    {
      rule: 'required',
      errorMessage: 'Введите дату',
    },
  ]).addField(agrenddate, [
    {
      rule: 'required',
      errorMessage: 'Введите дату',
    },
  ])

  return validator
}