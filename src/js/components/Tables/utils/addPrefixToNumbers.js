export function addPrefixToNumbers(input) {
  let prefixedNumbers, numbers

  if (Array.isArray(input)) {
    numbers = input
  } else {
    numbers = input.split(',').map(num => num.trim());
  }

  prefixedNumbers = numbers.map(num => `№${num}`);

  return prefixedNumbers.join(', ')
}