import { api } from "../../../settings/api.js";
import TableClients from "../../../components/Tables/TableClients/TableClients.js";
import { getClients } from "../../../settings/request.js";

class Clients {
  constructor({ loader }) {
    this.loader = loader
    this.tableClients = new TableClients('.table-clients')
    this.init()
  }

  init() {
    console.log('Clients');
    this.events()
  }

  events() {
    this.tableClients.onPageChange = async page => {
      try {
        this.loader.enable()
        const data = await getClients({ page })
        this.tableClients.render(data)
      } catch (error) {
        console.error(error)
      } finally {
        this.loader.disable()
      }
    }
  }

  async render() {
    try {
      this.loader.enable()
      // this.dashboardClient()
      const [dataDashboards, dataClients] = await Promise.all([[], getClients()])
      this.tableClients.render(dataClients)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  async dashboardClient() {
    try {
      const response = await api.get('/_dashboard_client_')
      if (response.status !== 200) return null
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default Clients