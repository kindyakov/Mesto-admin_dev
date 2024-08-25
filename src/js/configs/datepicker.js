export default function datePicker(el, options = {}) {
  return new AirDatepicker(el, {
    dateFormat: 'dd.MM.yyyy',
    isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    position: 'bottom',
    ...options
  });
}