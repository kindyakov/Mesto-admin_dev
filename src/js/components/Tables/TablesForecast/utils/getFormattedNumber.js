export function getFormattedNumber(value) {
  return (value % 1 !== 0) ? value.toFixed(2) : value;
}