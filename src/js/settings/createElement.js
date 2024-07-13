export const createElement = (tag, classes = [], innerHTML = '') => {
  const el = document.createElement(tag);
  el.classList.add(...classes);
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
};