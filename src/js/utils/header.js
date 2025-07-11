
function disableScroll() {
  const pagePos = window.scrollY
  document.body.classList.add('_lock')
  document.body.dataset.position = pagePos
}

function enableScroll() {
  const pagePos = parseInt(document.body.dataset.position, 10)
  document.body.style.top = 'auto'
  document.body.classList.remove('_lock')
  window.scroll({ top: pagePos, left: 0 })
  document.body.removeAttribute('data-position')
}

function lockPadding() {
  const paddingOffset = window.innerWidth - document.body.offsetWidth
  this.modalActive.style.paddingRight = paddingOffset ? paddingOffset + 'px' : 'none'
  document.querySelector('.wrapper').style.paddingRight = paddingOffset + 'px'
}

function unlockPadding() {
  this.modalActive.removeAttribute('style')
  document.querySelector('.wrapper').style.paddingRight = 0
}


export const burger = ({ selectorBurger = '.header-burger', selectorNav = '.header__nav', selectorSidebar = '.sidebar' }) => {
  const sidebar = document.querySelector(selectorSidebar)
  const burger = document.querySelector(selectorBurger)
  const nav = document.querySelector(selectorNav)
  const main = document.querySelector('.main')
  if (!burger || !nav) return

  burger.addEventListener('click', () => {
    if (burger.classList.contains('_active')) {
      burger.classList.remove('_active')
      nav.classList.remove('_active')
      main.classList.remove('_shadow')
      enableScroll()
    } else {
      burger.classList.add('_active')
      nav.classList.add('_active')
      main.classList.add('_shadow')
      disableScroll()
    }
  })
}

export const fixed = (selectorBurger = '.header-burger', selectorNav = '.header__nav') => {
  const header = document.querySelector('header')
  const headerBody = document.querySelector('.header__body')
  const burder = document.querySelector(selectorBurger)
  const nav = document.querySelector(selectorNav)
  let timer

  if (!headerBody || !header) return

  let isFixed = false, headerHeight = header.clientHeight

  window.addEventListener('scroll', () => {
    burder && burder.classList.remove('_active')
    nav && nav.classList.remove('_active')

    if (scrollY > headerHeight && !isFixed) {
      header.style.height = headerHeight + 'px'
      headerBody.style.cssText = `transform: translate(0, -100%);`
      timer = setTimeout(() => {
        isFixed = true
        headerBody.classList.add('_fixed')
        headerBody.style.cssText = `transform: translate(0, 0);`
        clearTimeout(timer)
      }, 200)
    } else if (scrollY === 0) {
      // header.removeAttribute('style')
      headerBody.removeAttribute('style')
      headerBody.classList.remove('_fixed')
      isFixed = false
    }
  })
}

export const scroll = (selectorLinks = '.link-scroll') => {
  const links = document.querySelectorAll(selectorLinks)
  const headerBody = document.querySelector('.header__body')
  const fullPageHeight = Math.max(
    document.body.scrollHeight, // Высота всего документа включая прокрутку
    document.documentElement.scrollHeight, // Высота всего документа для более старых браузеров
    document.body.offsetHeight, // Высота всего документа с учетом отступов (border, padding)
    document.documentElement.offsetHeight // Высота всего документа с учетом отступов для более старых браузеров
  );

  function scrollToSection(id) {
    const section = document.querySelector(id)
    if (!section) return

    const rect = section.getBoundingClientRect();
    const topPos = rect.top + document.documentElement.scrollTop - (headerBody ? headerBody.clientHeight + 20 : 0);

    window.scrollTo({ top: topPos, behavior: 'smooth' });
    history.replaceState(null, null, id);
  }

  links.length && links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      const id = link.getAttribute('href')
      scrollToSection(id)
    })
  })

  if (location.hash) scrollToSection(location.hash)
}

export const dropdown = (
  { selectorDropdown = '.dropdown',
    selectorDropdownActive = '_dropdown-active',
    selectorSubDropdown = '.sub-dropdown',
    selectorDropdownBtn = '.dropdown-btn',
    selectorDropdownBtnActive = '_dropdown-btn-active',
    md = 768
  }
) => {
  const dropdownButtons = document.querySelectorAll(selectorDropdownBtn)
  const mediaQueryList = window.matchMedia(`(max-width: ${md}px)`);

  function handleClick(e) {
    const btn = e.target.closest(selectorDropdownBtn)
    const dropdownLevel = btn.getAttribute('data-dropdown-level')
    const dropdown = btn.parentElement.querySelector(dropdownLevel === '1' ? selectorDropdown : selectorSubDropdown)

    if (btn.classList.contains(selectorDropdownBtnActive)) {
      const dropdownsSecondLevel = dropdown.querySelectorAll(selectorSubDropdown)
      const dropdownButtonsSecondLevel = dropdown.querySelectorAll(selectorDropdownBtn)

      dropdownsSecondLevel.length && dropdownsSecondLevel.forEach((dropdownSecondLevel, i) => {
        dropdownButtonsSecondLevel[i].classList.remove(selectorDropdownBtnActive)
        dropdownSecondLevel.classList.remove(selectorDropdownActive)
        dropdownSecondLevel.style.maxHeight = 0
      })

      btn.classList.remove(selectorDropdownBtnActive)
      dropdown.classList.remove(selectorDropdownActive)
      dropdown.style.maxHeight = 0
    } else {
      btn.classList.add(selectorDropdownBtnActive)

      if (dropdownLevel === '2') {
        const dropdownFirstLevel = dropdown.closest(selectorDropdown)
        dropdownFirstLevel.style.maxHeight = (dropdownFirstLevel.scrollHeight + dropdown.scrollHeight + 30) + 'px' // 30 - это отступы которые добавляются с классом selectorDropdown у selectorSubDropdown

        dropdown.classList.add(selectorDropdownActive)
        dropdown.style.maxHeight = dropdown.scrollHeight + 'px'
      } else {
        dropdown.classList.add(selectorDropdownActive)
        dropdown.style.maxHeight = dropdown.scrollHeight + 'px'
      }
    }
  }

  function removeStyleDropdown(dropdown) {
    if (dropdown) {
      dropdown.removeAttribute('style')
      dropdown.classList.remove(selectorDropdownActive)
    }
  }

  function handleMediaChange(mediaQueryList) {
    if (mediaQueryList.matches) {
      // Если условие медиа соответствует, добавляем обработчик
      dropdownButtons.forEach(btn => btn.addEventListener('click', handleClick));
    } else {
      const dropdownFirstLevel = document.querySelectorAll(selectorDropdown)
      const dropdownsSecondLevel = document.querySelectorAll(selectorSubDropdown)

      // Иначе удаляем обработчик
      dropdownButtons.forEach((btn, i) => {
        removeStyleDropdown(dropdownFirstLevel[i])
        removeStyleDropdown(dropdownsSecondLevel[i])

        btn.classList.remove(selectorDropdownBtnActive)
        btn.removeEventListener('click', handleClick)
      });
    }
  }

  // Добавляем обработчик события изменения условий медиа
  mediaQueryList.addEventListener('change', (e) => handleMediaChange(e.target));

  // Вызываем функцию обработчика, чтобы установить начальное состояние
  handleMediaChange(mediaQueryList);
}

export const linkActive = (linkSelector = '.header__link') => {
  const links = document.querySelectorAll(`a${linkSelector}`)

  links.length && links.forEach(link => {
    if (link.href === location.href) {
      link.classList.add('_active')
    } else {
      link.classList.remove('_active')
    }
  })
}

export const fixedSideBar = () => {
  const sidebarContent = document.querySelector('.sidebar-content')

  if (sidebarContent && window.innerWidth > 1200) {
    const wrapper = sidebarContent.parentElement;
    const paddingTop = 20
    const topRect = sidebarContent.getBoundingClientRect().top
    let isFixed = false;

    window.addEventListener('scroll', e => {
      if (window.innerWidth < 1200) return
      const rect = sidebarContent.getBoundingClientRect();
      const parentRect = wrapper.getBoundingClientRect();


      if (rect.height >  window.innerHeight) {
        if (isFixed) {
          sidebarContent.removeAttribute('style');
          isFixed = false;
        }
        return;
      }

      if (!isFixed && window.scrollY + paddingTop >= topRect && parentRect.bottom - rect.height >= paddingTop) {
        sidebarContent.style.cssText = `position: fixed; top: ${paddingTop}px; left: ${rect.left}px; max-width: ${rect.width}px;`
        isFixed = true;
      } else if (isFixed && window.scrollY + paddingTop <= topRect) {
        sidebarContent.removeAttribute('style')
        isFixed = false;
      } else if (isFixed && parentRect.bottom - rect.height <= paddingTop) {
        sidebarContent.style.cssText = `position: absolute; bottom: 0; left: 0; max-width: ${rect.width}px;`
        isFixed = false;
      }
    })
  }
}