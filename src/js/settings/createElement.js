export const createElement = (tag, { classes = [], attributes = [], content = '' }) => {
  const el = document.createElement(tag);

  // Добавляем классы
  el.classList.add(...classes);

  // Добавляем атрибуты
  attributes.forEach(([key, value]) => {
    el.setAttribute(key, value);
  });

  // Добавляем содержимое, которое может быть строкой или элементом
  if (typeof content === 'string') {
    el.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    el.appendChild(content);
  }

  return el;
};
