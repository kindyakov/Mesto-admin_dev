export function formattingPrice(price) {
  if (!price || price == 'null') return 0 + ' ₽'
  return price.toLocaleString('en-US') + ' ₽'
}