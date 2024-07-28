class SchemeMobile {
  constructor(wrapper) {
    this.warehouseSchemes = wrapper.querySelector('.warehouse__schemes')
    if (!this.warehouseSchemes) return
    this.wrapSchemes = this.warehouseSchemes.querySelectorAll('.wrap-scheme')
    if (!this.wrapSchemes.length) return

    this.maxWidthScheme = 1472
    this.stepsScheme = Math.ceil(this.maxWidthScheme / this.warehouseSchemes.clientWidth)
    this.stepScheme = 1
    this.timer = null
    this.currentX = 0 // Текущая позиция элемента
    this.init()
  }

  init() {
    this.stepsScheme = Math.ceil(this.maxWidthScheme / this.warehouseSchemes.clientWidth)
    // this.schemes = document.querySelectorAll('.scheme')
    // if (!this.schemes.length) return
    this.wrapSchemes.forEach(wrapScheme => {
      wrapScheme.setAttribute('data-step', this.stepScheme)
    })

    this.isMobile = false

    this.events()
  }

  events() {
    this.wrapSchemes.forEach(wrapScheme => {
      let startX = 0; // Начальная позиция касания
      let startY = 0; // Начальная позиция касания
      let startTime; // Временная метка начала касания
      let isScrollingX = false;
      let isScrollingY = false;

      wrapScheme.setAttribute('data-current-pos-x', this.currentX)

      if (window.innerWidth < this.maxWidthScheme) {
        this.currentX = -1 * (this.maxWidthScheme - this.warehouseSchemes.offsetWidth)
        this.wrapSchemes.forEach(wrapScheme => {
          wrapScheme.style.transform = `translateX(${this.currentX}px)`;
          wrapScheme.setAttribute('data-current-pos-x', this.currentX)
        })
      }

      wrapScheme.addEventListener('touchstart', e => {
        const wrapSchemePosX = +wrapScheme.getAttribute('data-current-pos-x')

        if (wrapSchemePosX !== this.currentX) {
          this.currentX = wrapSchemePosX
        }

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isScrollingY = false;
        isScrollingX = false
        startTime = e.timeStamp; // Сохраняем временную метку начала касания
        wrapScheme.style.transition = 'none'; // Отключаем transition при начале свайпа
      }, false);


      wrapScheme.addEventListener('touchmove', e => {
        let endX = e.touches[0].clientX;
        let endY = e.touches[0].clientY;
        let diffX = endX - startX;
        let diffY = endY - startY;

        // Если пользователь двигается по оси Y больше, чем по оси X,
        // то устанавливаем isScrollingY в true и возвращаем управление
        if (Math.abs(diffX) < Math.abs(diffY) && !isScrollingX) {
          isScrollingY = true;
        } else {
          isScrollingX = true
        }

        // Если isScrollingY равно true, то возвращаем управление
        if (isScrollingY) {
          return;
        }

        // Обновляем позицию элемента с учетом текущего смещения
        wrapScheme.style.transform = `translateX(${this.currentX + diffX}px)`
        wrapScheme.classList.add('_touch-action-none')
        document.body.classList.add('_lock')
        // document.documentElement.classList.add('_lock')
      }, { passive: false });


      wrapScheme.addEventListener('touchend', e => {
        if (isScrollingY) {
          return;
        }

        let endX = e.changedTouches[0].clientX;
        let diffX = endX - startX;
        // Определите ваш максимальный предел для инерции
        let maxInertiaDistance = 200; // Примерное значение, которое следует настроить под ваши нужды

        // Обновляем текущую позицию элемента после окончания свайпа
        this.currentX += diffX;

        // Возвращаем transition для плавного завершения анимации
        wrapScheme.style.transition = 'transform 0.5s ease';

        // Обработка инерции - если пользователь провел палец достаточно быстро, элемент будет продолжать двигаться в том же направлении
        // В этом примере, мы просто продолжаем анимацию с той же скоростью и направлением, как и было до поднятия пальца.
        let velocity = Math.abs(diffX / (e.timeStamp - startTime));
        let inertiaDistance = diffX * velocity * 0.4; // Множитель для более ярко выраженной инерции

        // Ограничьте инерцию максимальным значением
        if (inertiaDistance > 0) {
          inertiaDistance = Math.min(inertiaDistance, maxInertiaDistance);
        } else {
          inertiaDistance = Math.max(inertiaDistance, -1 * maxInertiaDistance);
        }

        if (Math.abs(inertiaDistance) > 50) {
          // Если скорость быстро достаточно, продолжаем анимацию с инерцией
          this.currentX += inertiaDistance;
        }

        // Применяем новую позицию элемента
        if (this.currentX < (-1 * wrapScheme.offsetWidth)) {
          this.currentX = -1 * (this.maxWidthScheme - this.warehouseSchemes.offsetWidth)
        } else if (this.currentX > this.warehouseSchemes.offsetWidth) {
          this.currentX = 0
        }

        wrapScheme.style.transform = `translateX(${this.currentX}px)`;
        wrapScheme.setAttribute('data-step', 0)
        wrapScheme.setAttribute('data-current-pos-x', this.currentX)
        wrapScheme.classList.remove('_touch-action-none')
        document.body.classList.remove('_lock')
        document.documentElement.classList.remove('_lock')
      }, false);
    })

    // this.warehouseSchemes.addEventListener('click', e => {
    //   if (e.target.closest('.warehouse__schemes_button')) {
    //     const btn = e.target.closest('.warehouse__schemes_button')
    //     const wrapScheme = this.warehouseSchemes.querySelector('.tabs-content-schemes._tab-content-active .wrap-scheme')
    //     const schemeStep = wrapScheme.getAttribute('data-step')
    //     const maxWidth = this.warehouseSchemes.clientWidth
    //     const moveX = maxWidth * this.stepScheme
    //     const maxMoveX = this.maxWidthScheme - maxWidth

    //     if (+schemeStep !== this.stepScheme) {
    //       this.stepScheme = 1
    //       this.currentX = 0
    //       wrapScheme.setAttribute('data-current-pos-x', this.currentX)
    //       wrapScheme.setAttribute('data-step', this.stepScheme)
    //       wrapScheme.style.transform = `translateX(0px)`;
    //       return
    //     }

    //     if (btn.classList.contains('btn-left')) {
    //       if (this.stepScheme <= 1) return
    //       if (this.stepScheme == 2) {
    //         this.stepScheme = 1
    //         this.currentX = 0
    //       } else {
    //         this.stepScheme -= 1
    //         this.currentX = -1 * (this.stepScheme * maxWidth - maxWidth)
    //       }
    //     } else if (btn.classList.contains('btn-right')) {
    //       if (this.stepScheme >= this.stepsScheme) return
    //       this.stepScheme += 1
    //       this.currentX = -1 * (moveX > maxMoveX ? maxMoveX : moveX)
    //     }

    //     wrapScheme.style.transform = `translateX(${this.currentX}px)`;
    //     wrapScheme.setAttribute('data-step', this.stepScheme)
    //     wrapScheme.setAttribute('data-current-pos-x', this.currentX)
    //   }
    // })

    window.addEventListener('resize', () => {
      this.isMobile = false
      if (window.innerWidth > this.maxWidthScheme) return
      this.isMobile = true
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.stepsScheme = Math.ceil(this.maxWidthScheme / this.warehouseSchemes.clientWidth)
        this.stepScheme = 1
        this.currentX = -1 * (this.maxWidthScheme - this.warehouseSchemes.offsetWidth)
        this.wrapSchemes.forEach(wrapScheme => {
          wrapScheme.style.transform = `translateX(${this.currentX}px)`;
          wrapScheme.setAttribute('data-steps', this.stepsScheme)
          wrapScheme.setAttribute('data-step', this.stepScheme)
          wrapScheme.setAttribute('data-current-pos-x', this.currentX)
        })
      }, 200)
    })
  }
}

export default SchemeMobile