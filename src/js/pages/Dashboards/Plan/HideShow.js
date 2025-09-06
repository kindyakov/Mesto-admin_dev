class HideShow {
  static initButtonsHideShow(wrapper) {
    const buttons = wrapper.querySelectorAll('.btn-hidden')

    buttons.length && buttons.forEach(btn => {
      const wrapper = btn.closest('.relative')
      const wrapperBlock = wrapper.querySelector('.block-hide-show')

      if (!wrapperBlock) return;

      btn.addEventListener('click', (e) => {
        e.preventDefault();

        const isHidden = wrapperBlock.hasAttribute('data-hidden');

        if (isHidden) {
          // Показываем блок
          this.showBlock(wrapperBlock, btn);
        } else {
          // Скрываем блок
          this.hideBlock(wrapperBlock, btn);
        }
      })
    })
  }

  static hideBlock(wrapperBlock, btn) {
    // Получаем текущую высоту блока
    const currentHeight = wrapperBlock.scrollHeight;

    // Устанавливаем фиксированную высоту
    wrapperBlock.style.height = currentHeight + 'px';
    wrapperBlock.style.overflow = 'hidden';
    wrapperBlock.style.transition = 'height 0.3s ease, opacity 0.3s ease';

    // Принудительно перерисовываем, чтобы применилась высота
    wrapperBlock.offsetHeight;

    // Анимируем к нулевой высоте
    wrapperBlock.style.height = '0px';
    wrapperBlock.style.opacity = '0';

    // Отмечаем как скрытый
    wrapperBlock.setAttribute('data-hidden', 'true');

    // Меняем состояние кнопки на активное
    this.setButtonActive(btn);

    // После завершения анимации устанавливаем display: none
    setTimeout(() => {
      if (wrapperBlock.hasAttribute('data-hidden')) {
        wrapperBlock.style.display = 'none';
      }
    }, 300);
  }

  static showBlock(wrapperBlock, btn) {
    // Убираем display: none и готовимся к анимации
    wrapperBlock.style.display = '';
    wrapperBlock.style.height = '0px';
    wrapperBlock.style.opacity = '0';
    wrapperBlock.style.overflow = 'hidden';
    wrapperBlock.style.transition = 'height 0.3s ease, opacity 0.3s ease';

    // Принудительно перерисовываем
    wrapperBlock.offsetHeight;

    // Получаем натуральную высоту контента
    const targetHeight = wrapperBlock.scrollHeight;

    // Анимируем к натуральной высоте
    wrapperBlock.style.height = targetHeight + 'px';
    wrapperBlock.style.opacity = '1';

    // Убираем атрибут скрытого состояния
    wrapperBlock.removeAttribute('data-hidden');

    // Меняем состояние кнопки на неактивное
    this.setButtonInactive(btn);

    // После завершения анимации убираем фиксированную высоту
    setTimeout(() => {
      if (!wrapperBlock.hasAttribute('data-hidden')) {
        wrapperBlock.style.height = '';
        wrapperBlock.style.overflow = '';
        wrapperBlock.style.transition = '';
      }
    }, 300);
  }

  static setButtonActive(btn) {
    // Добавляем классы для активного состояния
    btn.classList.add('bg-blue-100', 'border-blue-500', 'text-blue-700');
    btn.classList.remove('bg-gray-100', 'border-gray-300', 'text-gray-600');

    // Добавляем тень для большей выразительности
    btn.classList.add('shadow-md');

    // Меняем иконку, если есть
    const icon = btn.querySelector('svg, i');
    if (icon) {
      icon.classList.add('rotate-180');
    }
  }

  static setButtonInactive(btn) {
    // Убираем классы активного состояния
    btn.classList.remove('bg-blue-100', 'border-blue-500', 'text-blue-700', 'shadow-md');
    btn.classList.add('bg-gray-100', 'border-gray-300', 'text-gray-600');

    // Убираем поворот иконки
    const icon = btn.querySelector('svg, i');
    if (icon) {
      icon.classList.remove('rotate-180');
    }
  }
}

export default HideShow;