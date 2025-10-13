export function formattingPrice(price) {
	if (!price || price === 'null') return '0 ₽';

	const num = Number(price);
	if (isNaN(num)) return '0 ₽'; // защита от некорректных значений

	return num.toLocaleString('ru-RU') + ' ₽';
}

export function formatPhoneNumber(phoneNumber) {
	const cleaned = ('' + phoneNumber).replace(/\D/g, ''); // Оставляем только цифры
	const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);

	if (match) {
		return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
	}

	return '';
}
