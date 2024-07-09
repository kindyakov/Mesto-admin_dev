import Dashboards from "../Dashboards.js";


class Marketing extends Dashboards {
  constructor({ loader }) {
    super({ loader, page: 'marketing' });
  }

  async getData(data = {}) {
    return []
  }

  async getDashboardData(data = {}) {
    return []
  }
}

export default Marketing