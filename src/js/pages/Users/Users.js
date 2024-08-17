import tippy from "tippy.js";
import Page from "../Page.js"
import { getManagersList } from "../../settings/request.js";
import { createElement } from "../../settings/createElement.js";
import { employeeHtml, accessesPopupHtml } from "./html.js";
import { api } from "../../settings/api.js";
import { outputInfo } from "../../utils/outputinfo.js";

class Users extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [],
      page: 'users'
    });

    this.usersEl = this.wrapper.querySelector('.users')
  }

  async getData(data = {}) {
    return getManagersList(data)
  }

  onRender(data) {
    const { managers = [] } = data

    if (managers.length) {
      this.usersEl.innerHTML = ''
      const organizeEmployees = this.organizeEmployees(managers)
      organizeEmployees.forEach(manager => this.usersEl.insertAdjacentElement('beforeend', this.managerRender(manager)))
    } else {
      this.usersEl.innerHTML = 'Нет сотрудников'
    }
  }

  organizeEmployees(employees) {
    // Создаем объект для быстрого поиска сотрудника по ID
    const employeesById = employees.reduce((acc, employee) => {
      acc[employee.manager_id] = employee;
      employee.subordinates = []; // Инициализируем массив subordinates для каждого сотрудника
      return acc;
    }, {});

    // Проходим по каждому сотруднику и добавляем его в список подчиненных его руководителя
    employees.forEach(employee => {
      const managerId = employee.chief_id;
      if (managerId !== null) {
        const manager = employeesById[managerId];
        manager.subordinates.push(employee);
      }
    });

    // Фильтруем исходный массив, оставляя только сотрудников без руководителя (корневые элементы)
    return employees.filter(employee => employee.chief_id === null);
  }

  managerRender(manager) {
    const employee = createElement('div', { classes: ['employee'], content: employeeHtml(manager) })
    const btnActions = employee.querySelector('.button-actions')

    if (manager.subordinates.length) {
      const btnOpenSubordinates = employee.querySelector('.button-open-subordinates')
      const subordinatesEl = employee.querySelector('.subordinates')

      btnOpenSubordinates.classList.add('_vis')

      manager.subordinates.forEach(subordinate => subordinatesEl.insertAdjacentElement('beforeend', this.managerRender(subordinate)))

      btnOpenSubordinates.addEventListener('click', () => {
        btnOpenSubordinates.classList.toggle('_open')
        subordinatesEl.classList.toggle('_open')
      })
    }

    this.accessesPopupRender(btnActions, manager)

    return employee
  }

  accessesPopupRender(btn, manager) {
    const instance = tippy(btn, {
      duration: 0,
      allowHTML: true,
      content: accessesPopupHtml(manager),
      trigger: 'click',
      placement: 'bottom-start',
      interactive: true,
      appendTo: document.body,
      maxWidth: 320,
    })

    const accessesPopup = instance.popper.querySelector('.accesses-popup')
    const inputs = accessesPopup.querySelectorAll('input')
    let data = { manager_id: manager.manager_id }, timer = null

    inputs.length && inputs.forEach(input => {
      input.addEventListener('change', () => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          inputs.forEach(input => data[input.name] = input.checked ? 1 : 0)
          this.setAccesses(data)
        }, 1000);
      })
    })
  }

  async setAccesses(data) {
    try {
      this.loader.enable()
      const response = await api.post('/_set_accesses_', data)
      if (response.status !== 200) return
      outputInfo(response.data)
    } catch (error) {
      console.log(error)
      throw error
    } finally {
      this.loader.disable()
    }
  }
}

export default Users