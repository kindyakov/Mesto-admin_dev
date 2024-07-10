import { buildQueryParams } from "../utils/buildQueryParams.js";
import { api } from "./api.js";

function getCreate(rout) {
  return async function (params = {}) {
    try {
      const response = await api.get(`${rout}${buildQueryParams(params)}`)
      if (response.status !== 200) return null
      return response.data
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}

export const getClients = getCreate('/_main_clients_')

export const getPayments = getCreate('/_main_payments_')

export const getAgreements = getCreate('/_main_agreements_')

export const getDashboardClient = getCreate('/_dashboard_client_')

export const getDashboardWarehouse = getCreate('/_dashboard_warehouse_')

export const getDashboardFinance = getCreate('/_dashboard_finance_')

export const getDashboardMarketing = getCreate('/_dashboard_marketing_')

export const getFuturePayments = getCreate('/_get_future_payments_')

export const getRooms = getCreate('/_main_rooms_/')

export const getWarehousesInfo = getCreate('/_get_warehouses_info_for_admin_')

export const getOldClient = getCreate('/_get_old_client_data_')

export async function getClientTotal(userId) {
  try {
    const response = await api.get(`/_get_client_total_/${userId}/`)
    if (response.status !== 200) return null
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}