import { api } from "../../../settings/api.js";
import ClientsTable from "../../../components/Tables/layout/ClientsTable.js";
import { getClients } from "../../../settings/request.js";

class Clients {
  constructor({ loader }) {
    this.loader = loader
    this.clientsTable = new ClientsTable('.table-clients')
    this.init()
  }

  init() {
    console.log('Clients');
    this.events()
  }

  events() {
    this.clientsTable.onPageChange = async page => {
      try {
        this.loader.enable()
        const data = await getClients({ page })
        this.clientsTable.render(data)
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

      this.clientsTable.render(dataClients)
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