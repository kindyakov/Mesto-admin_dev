import Inputmask from 'inputmask';
import { createCalendar } from '../../../settings/createCalendar.js';
import { createValidator } from '../../../settings/createValidator.js';

const getMinDate = () => {
	const today = new Date();
	const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
	return minDate;
};

export function validateClient(form, options) {
	if (!form) return;
	const validator = createValidator(form, options);

	const inputBirthday = form.querySelector('input[name="birthday"]');
	inputBirthday.classList.add('input-client-birthday-modal');

	const calendar = createCalendar(inputBirthday, {
		dateFormat: 'd.m.Y', // 'Y-m-d',
		maxDate: getMinDate(),
		appendTo: inputBirthday.parentElement,
		clickOpens: false
	});

	validator.calendars = [calendar];
	// validator.calendars.forEach(c => c.set('clickOpens', false))

	const inputPhone = form.querySelector('input[name="username"]');
	Inputmask.default('+7 (999) 999-99-99').mask(inputPhone);

	validator
		.addField(form.querySelector('input[name="fullname"]'), [
			{
				rule: 'required',
				errorMessage: 'Введите фио'
			},
			{
				rule: 'customRegexp',
				value: /^[А-ЯЁа-яё\s]+$/,
				errorMessage: 'Неверный формат'
			}
		])
		.addField(form.querySelector('input[name="birthday"]'), [
			{
				rule: 'required',
				errorMessage: 'Введите дату рождения'
			}
		])
		.addField(form.querySelector('input[name="username"]'), [
			{
				rule: 'required',
				errorMessage: 'Введите телефон'
			},
			{
				validator: value => {
					const unmaskPhone = Inputmask.default.unmask(value, { mask: '+7 (999) 999-99-99' });
					return Boolean(Number(unmaskPhone) && unmaskPhone.length === 10);
				},
				errorMessage: 'Неверный формат'
			}
		])
		.addField(form.querySelector('input[name="email"]'), [
			{
				rule: 'required',
				errorMessage: 'Введите почту'
			},
			{
				rule: 'email',
				errorMessage: 'Неверный формат'
			}
		]);

	return validator;
}

export function validateRequisites(form, options) {
	if (!form) return;
	const validator = createValidator(form, options);

	const inputBik = form.querySelector('input[name="bik"]');
	const inputInn = form.querySelector('input[name="inn"]');
	const inputKpp = form.querySelector('input[name="kpp"]');
	const inputBank = form.querySelector('input[name="bank"]');
	const inputRs = form.querySelector('input[name="rs"]');
	const inputKs = form.querySelector('input[name="ks"]');

	validator
		.addField(form.querySelector('input[name="fullname"]'), [
			{
				rule: 'required',
				errorMessage: 'Заполните поле'
			},
			{
				rule: 'customRegexp',
				value: /^[А-ЯЁа-яё\s]+$/,
				errorMessage: 'Неверный формат'
			}
		])
		.addField(form.querySelector('input[name="address"]'), [
			{
				rule: 'required',
				errorMessage: 'Заполните поле'
			}
		])
		.addField(form.querySelector('input[name="bank"]'), [
			{
				rule: 'required',
				errorMessage: 'Заполните поле'
			}
		])
		.addField(form.querySelector('input[name="rs"]'), [
			{
				rule: 'required',
				errorMessage: 'Заполните поле'
			},
			{
				validator: value => {
					if (value.length > 20) {
						inputRs.value = value.slice(0, 20);
					} else {
						inputRs.value = value.replace(/[^0-9]/g, '');
					}
					return inputRs.value.replace(/[^0-9]/g, '').length === 20;
				},
				errorMessage: 'Неверный формат'
			}
		])
		.addField(form.querySelector('input[name="bik"]'), [
			{
				rule: 'required',
				errorMessage: 'Заполните поле'
			},
			{
				validator: value => {
					if (value.length > 9) {
						inputBik.value = value.slice(0, 9);
					} else {
						inputBik.value = value.replace(/[^0-9]/g, '');
					}
					return inputBik.value.replace(/[^0-9]/g, '').length === 9;
				},
				errorMessage: 'Неверный формат'
			}
		])
		.addField(form.querySelector('input[name="ks"]'), [
			{
				rule: 'required',
				errorMessage: 'Заполните поле'
			},
			{
				validator: value => {
					if (value.length > 20) {
						inputKs.value = value.slice(0, 20);
					} else {
						inputKs.value = value.replace(/[^0-9]/g, '');
					}
					return inputKs.value.replace(/[^0-9]/g, '').length === 20;
				},
				errorMessage: 'Неверный формат'
			}
		])
		.addField(form.querySelector('input[name="inn"]'), [
			{
				rule: 'required',
				errorMessage: 'Заполните поле'
			},
			{
				validator: (value, data) => {
					if (value.length > 12) {
						inputInn.value = value.slice(0, 12);
					} else {
						inputInn.value = value.replace(/[^0-9]/g, '');
					}
					let l = inputInn.value.replace(/[^0-9]/g, '').length;
					return 10 <= l && l <= 12;
				},
				errorMessage: 'Неверный формат'
			}
		])
		.addField(form.querySelector('input[name="kpp"]'), [
			{
				rule: 'required',
				errorMessage: 'Заполните поле'
			},
			{
				validator: value => {
					if (value.length > 9) {
						inputKpp.value = value.slice(0, 9);
					} else {
						inputKpp.value = value.replace(/[^0-9]/g, '');
					}
					return inputKpp.value.replace(/[^0-9]/g, '').length === 9;
				},
				errorMessage: 'Неверный формат'
			}
		]);

	return validator;
}
