export default function datePicker(el, options = {}) {
	return new AirDatepicker(el, {
		dateFormat: 'dd.MM.yyyy',
		// На iOS (Safari 16+/17+) мобильный режим AirDatepicker падает на создании overlay,
		// поэтому принудительно отключаем mobile-режим. UI остаётся десктопным, но работает стабильно.
		// isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
		isMobile: false,
		position: 'bottom',
		...options,
	});
}