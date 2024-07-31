import { Loader } from "../../modules/myLoader.js";
import { Accordion } from "../../modules/myAccordion.js";

class Navigation {
  constructor() {
    this.navLinks = document.querySelectorAll('[data-path]');
    this.contents = document.querySelectorAll('.content-main');
    this.pages = {
      'dashboards/clients': 'Dashboards/Clients/Clients.js',
      'dashboards/finance': 'Dashboards/Finance/Finance.js',
      'dashboards/marketing': 'Dashboards/Marketing/Marketing.js',
      'dashboards/warehouse': 'Dashboards/Warehouse/Warehouse.js',
      'dashboards/plan-fact': 'Dashboards/PlanFact/PlanFact.js',
      'dashboards/sales-channels': 'Dashboards/SalesChannels/SalesChannels.js',
      'charging-locks': 'ChargingLocks/ChargingLocks.js',
      'users': 'Users/Users.js',
      'working-hours': 'WorkingHours/WorkingHours.js',
      'forecast': 'Forecast/Forecast.js',
      'rooms': 'Rooms/Rooms.js',
      'payments': 'Payments/Payments.js',
      'agreements': 'Agreements/Agreements.js',
      'list-clients': 'ListClients/ListClients.js',
      'messages': 'Messages/Messages.js'
    };
    this.loader = new Loader(document.querySelector('.main'), {
      customSelector: '_main-loader'
    });
    this.sidebarAccordion = new Accordion({ uniqueName: 'sidebar-accordion', isAccordion: false });
    this.modulesCache = {};  // Добавляем кэш для загруженных модулей
  }

  init(warehouse) {
    // Сохраняю склад
    this.warehouse = warehouse

    // Добавляем обработчики событий на ссылки навигации
    this.navLinks.forEach(link => {
      link.addEventListener('click', this.navigate.bind(this));
    });

    // Обработка событий изменения состояния истории
    window.addEventListener('hashchange', this.handleHashChange.bind(this));

    // Загружаем контент в зависимости от текущего URL при первой загрузке страницы
    const initialPath = window.location.hash.slice(1);

    if (initialPath) {
      this.loadContent(initialPath);
    } else {
      const defaultPath = Object.keys(this.pages)[0];
      window.location.hash = defaultPath;
    }
  }

  navigate(e) {
    const path = e.target.closest('[data-path]').getAttribute('data-path');
    if (path) {
      window.location.hash = path;
    }
  }

  handleHashChange() {
    const path = window.location.hash.slice(1);
    this.loadContent(path);
  }

  loadContent(path) {
    if (!this.pages[path]) {
      console.error('Маршрут не найден:', path);
      return;
    }

    this.loader.enable();
    this.switchingTabs(path);

    if (this.modulesCache[path]) {
      // Если модуль уже загружен, вызываем только render
      this.loader.disable();
      this.modulesCache[path].render();
    } else {
      // Загружаем модуль и сохраняем его в кэш
      import(`../../pages/${this.pages[path]}`)
        .then(module => {
          this.loader.disable();
          const page = new module.default({ loader: this.loader, warehouse: this.warehouse });
          this.modulesCache[path] = page;  // Сохраняем модуль в кэш
          page.render();
        })
        .catch(error => {
          console.error('Ошибка загрузки модуля:', error);
        });
    }
  }

  switchingTabs(path) {
    this.contents.forEach(content => {
      const attr = content.getAttribute('data-content');
      const link = document.querySelector(`[data-path="${attr}"]`);

      if (attr === path) {
        content.classList.add('_active');
        link.classList.add('_active');

        const accordion = link.closest('._my-accordion:not(._open)');
        if (accordion) {
          this.sidebarAccordion.open(accordion);
        }
      } else {
        content?.classList.remove('_active');
        link?.classList.remove('_active');
      }
    });
  }
}

export default Navigation;