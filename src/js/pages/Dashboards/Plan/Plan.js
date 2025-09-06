import Dashboards from '../Dashboards.js';
import TablePlan from '../../../components/Tables/TablePlan/TablePlan.js';
import { getFinancePlan, getRooms } from '../../../settings/request.js';

class Plan extends Dashboards {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-plan',
          TableComponent: TablePlan,
          params: {
            getData: getFinancePlan
          },
        },
      ],

      page: 'dashboards/plan'
    });
  }

  async getData(queryParams = {}) {
    return getFinancePlan();
  }
}

export default Plan;