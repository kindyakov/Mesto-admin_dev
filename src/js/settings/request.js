import { api } from "./api.js";
import { buildQueryParams } from "../utils/buildQueryParams.js";
import { getFormattedDate } from "../utils/getFormattedDate.js";
import { getCurrentTimeString } from "../utils/getCurrentTimeString.js";

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

function getCreateTotal(rout) {
  return async function (id) {
    try {
      const response = await api.get(`${rout}/${id}`)
      if (response.status !== 200) return null
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

function downloadCreate(rout, opts = {}) {
  const options = {
    nameFile: `Файл от ${getFormattedDate()}`,
    ...opts
  }

  return async function (data = {}) {
    try {
      const response = await api.post(`${rout}`, data, { responseType: 'blob' })
      if (response.status !== 200) return null
      if (response.data.msg_type) {
        outputInfo(response.data)
        return response.data
      } else {
        const blob = new Blob([response.data], { type: response.headers['content-type'] })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url;
        link.download = `${options.nameFile} ${getFormattedDate()}_${getCurrentTimeString()}.xlsx`
        link.click()
        URL.revokeObjectURL(url)
        return true
      }
    }
    catch (error) {
      console.error(error)
      throw error
    }
  }
}

// ============================================================================>

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

export const getMovingOutClients = getCreate('/_get_moving_out_clients_')

export const getNonApprovedClients = getCreate('/_get_nonapproved_clients_')

export const getLocksPower = getCreate('/_get_locks_power_/')
// ============================================================================>

export const getClientTotal = getCreateTotal('/_get_client_total_')

export const getAgreementTotal = getCreateTotal('/_get_agreement_total_')

// ============================================================================>

export const downloadPayments = downloadCreate('/download_payments', { nameFile: `Платежи от` })

export const downloadAgreement = downloadCreate('/download_reestr', { nameFile: `Договора от` })

// /download_agr
export async function downloadAgr(room_id) {
  try {
    const response = await api.post(`/download_agr/${room_id}`, { responseType: 'blob' })
    if (response.status !== 200) return
    if (response.data.msg_type) {
      outputInfo(response.data)
    } else {
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url;
      link.download = `Договор от ${getFormattedDate()}_${getCurrentTimeString()}.xlsx`
      link.click()
      URL.revokeObjectURL(url)
    }
  }
  catch (error) {
    console.error(error)
    throw error
  }

}