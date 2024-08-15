import Page from "../Page.js";
import TablesForecastSales from "../../components/Tables/TablesForecast/TablesForecastSales/TablesForecastSales.js";
import TableForecastArea from "../../components/Tables/TablesForecast/TableForecastArea/TableForecastArea.js";
import { getFinancePlan, getSalesPlan } from "../../settings/request.js";

import { Tabs } from "../../modules/myTabs.js"

class Forecast extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-forecast',
          TableComponent: TablesForecastSales,
          options: {
            paginationPageSize: 15
          },
          params: {
            getData: getSalesPlan,
          }
        },
        {
          tableSelector: '.table-forecast-area',
          TableComponent: TableForecastArea,
          options: {
            paginationPageSize: 15
          },
          params: {
            getData: getFinancePlan,
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

  async getData(queryParams = {}) {
    return Promise.all([getSalesPlan(queryParams), getFinancePlan(queryParams)])
  }
}

export default Forecast