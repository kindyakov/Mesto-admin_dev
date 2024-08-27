export function cellColorize(value, params) {
  if (value < 100) {
    params.eGridCell.classList.add('bg-red')
  } else {
    params.eGridCell.classList.add('bg-green')
  }
}