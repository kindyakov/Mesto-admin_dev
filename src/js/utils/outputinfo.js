// msg - текст ответа от сервера или какое-либо саобщение
// msg_type - тип ответа или сообщения

const defaultOptions = {
  msg: 'Нет текста ответа',
  msg_type: 'error',
  duration: 400,
  removeTime: 5000,
  gap: 10,
  isConfirm: false, // Новая опция для подтверждения
  animateShow: [
    { transform: 'translate(-50%, -100%) scale(0.5)', opacity: '0', visibility: 'hidden' },
    { transform: 'translate(-50%, 20px) scale(1)', opacity: '1', visibility: 'visible' }
  ],
  throttleTime: 1000 // Добавляем время троттлинга в миллисекундах
}

let lastCallTime = 0;

export const outputInfo = (options, callback) => {
  const now = Date.now();

  if (now - lastCallTime < defaultOptions.throttleTime) {
    return; // Прерываем вызов функции, если он происходит слишком часто
  }

  lastCallTime = now;

  const body = document.body

  const { msg, msg_type, animateShow, duration, removeTime, gap, isConfirm } = Object.assign(defaultOptions, options)

  let outputInfo = document.querySelector('.output-info')
  let spanArr = []

  if (!outputInfo) {
    body.insertAdjacentHTML('beforeend', `<div class="output-info _active"></div>`)
    outputInfo = document.querySelector('.output-info')
  } else {
    outputInfo.classList.add('_active')
    spanArr = outputInfo.querySelectorAll('.output-info__span')
  }

  // Проверка на наличие активного поля с кнопками подтверждения
  if (isConfirm && outputInfo.querySelector('.output-info__span.is-confirm')) {
    return; // Прерываем функцию, если уже есть активное поле с подтверждением
  }

  // Если isConfirm, добавляем кнопки подтверждения
  const content = isConfirm
    ? `<span class="output-info__span is-confirm" data-top="20">
        <span>${msg}</span>  
        <div>
          <button class="confirm-no">Нет</button>
          <button class="confirm-yes">Да</button>
        </div>
      </span>`
    : `<span class="output-info__span" data-top="20">${msg}</span>`;

  outputInfo.insertAdjacentHTML('afterbegin', content);

  const span = outputInfo.querySelector('.output-info__span')

  if (span.offsetWidth > window.innerWidth) {
    span.style.width = '100%'
    span.style.whiteSpace = 'wrap'
  }

  const spanHeight = span.getBoundingClientRect().height

  const anim = span.animate(animateShow, { duration: duration });
  anim.addEventListener('finish', () => finishAnim(isConfirm));

  addGap()

  if (msg_type === 'success') {
    span.classList.add('_success')
  } else if (msg_type === 'error') {
    span.classList.add('_error')
  } else if (msg_type === 'warning') {
    span.classList.add('_warning')
  } else {
    span.classList.add('_error')
  }

  // Обработчики событий для кнопок подтверждения
  if (isConfirm) {
    const yesButton = span.querySelector('.confirm-yes');
    const noButton = span.querySelector('.confirm-no');

    const handleConfirm = (isConfirmed) => {
      if (callback && typeof callback === 'function') {
        callback(isConfirmed);
      }
      yesButton.removeEventListener('click', onYesClick);
      noButton.removeEventListener('click', onNoClick);
      span.remove();
      !outputInfo.children.length && outputInfo.classList.remove('_active');
    }

    const onYesClick = () => handleConfirm(true);
    const onNoClick = () => handleConfirm(false);

    yesButton.addEventListener('click', onYesClick);
    noButton.addEventListener('click', onNoClick);
  }

  function addGap() {
    spanArr.length && spanArr.forEach(el => {
      let top = +el.getAttribute('data-top') + spanHeight + gap
      el.setAttribute('data-top', top)
      if (!el.classList.contains('_remove')) {
        el.style.transform = `translate(-50%, ${top}px)`
      }
    });
  }

  function finishAnim(isConfirm) {
    span.style.transform = `translate(-50%, 20px)`

    if (!isConfirm) {
      setTimeout(() => {
        span.style.transform = `translate(-50%, ${span.dataset.top}px) scale(0)`
        span.style.opacity = 0
        span.classList.add('_remove')
        setTimeout(() => {
          span.remove()
          !outputInfo.children.length && outputInfo.classList.remove('_active')
        }, duration)
      }, removeTime)
    }
  }
}