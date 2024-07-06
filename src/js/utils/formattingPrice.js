export function formattingPrice(price) {
  if (!price || price == 'null') return 0 + ' ₽'
  return price.toLocaleString('en-US') + ' ₽'
}

export function formatPhoneNumber(phoneNumber) {
  const cleaned = ('' + phoneNumber).replace(/\D/g, ''); // Оставляем только цифры
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);

  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
  }

  return null; // В случае некорректного формата возвращаем null или можно вернуть исходную строку.
}