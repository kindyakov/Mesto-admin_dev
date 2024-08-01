import Page from "../Page.js";
import TablesForecast from "../../components/Tables/TablesForecast/TablesForecast.js";
import TableForecastArea from "../../components/Tables/TableForecastArea/TableForecastArea.js";
import { getFinancePlan, getSalesPlan } from "../../settings/request.js";

import { Tabs } from "../../modules/myTabs.js"

class Forecast extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-forecast',
          TableComponent: TablesForecast,
          getData: getSalesPlan,
          options: {
            paginationPageSize: 15
          }
        },
        {
          tableSelector: '.table-forecast-area',
          TableComponent: TableForecastArea,
          getData: getFinancePlan,
          options: {
            paginationPageSize: 15
          }
        },
      ],
      page: 'forecast'
    });

    this.tabs = new Tabs({
      classBtnActive: '_active',
      classContentActive: '_active',
      specialSelector: '.forecast-tabs',
      uniqueName: true,
    })
  }

  async getData(data = {}) {
    return Promise.all([getFinancePlan(data), getSalesPlan(data)])
  }
}

export default Forecast