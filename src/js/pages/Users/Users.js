import Page from "../Page.js"
import OrgChartCanvas from "./OrgChartCanvas.js";
import { getManagersList } from "../../settings/request.js";

class Users extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [],
      page: 'users'
    });

    // Пример использования
    const nodes = [
      { id: 1, pid: null, name: "Генеральный директор", title: "CEO" },
      { id: 2, pid: 1, name: "Менеджер отдела", title: "Manager" },
      { id: 3, pid: 2, name: "Специалист отдела", title: "Specialist" }
    ];

    const orgChart = new OrgChartCanvas('#users-chart', nodes);
  }

  async getData(data = {}) {
    return getManagersList(data)
  }

  onRender(data) {
    const { managers = [] } = data

    if (!managers.length) return

    // Если chart уже существует, уничтожаем его перед перерисовкой

    console.log(managers)


  }

  prepareNodes(managers) {
    // Преобразуем список менеджеров в иерархическую структуру для OrgChart
    return managers.map(manager => ({
      id: manager.manager_id,
      pid: manager.chief_id, // parentId - идентификатор родителя (начальника)
      name: manager.manager_fullname,
      title: manager.role
    }));
  }
}

export default Users