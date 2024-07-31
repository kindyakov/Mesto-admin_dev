import Page from "../Page.js";

class Forecast extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        // {
        //   tableSelector: '.table-clients',
        //   TableComponent: TableClients,
        //   options: {
        //     paginationPageSize: 15
        //   }
        // }
      ],
      page: 'list-clients'
    });
  }

  async getData(data = {}) {
    return []
  }
}

export default Forecast