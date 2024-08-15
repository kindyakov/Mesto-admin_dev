import Dashboards from "../Dashboards.js";
import { getDashboardMarketing } from "../../../settings/request.js";

class Marketing extends Dashboards {
  constructor({ loader }) {
    super({ loader, page: 'dashboards/marketing' });
  }

  async getData(data = {}) {
    return []
  }

  async getDashboardData(data = {}) {
    return getDashboardMarketing(data)
  }
}

export default Marketing