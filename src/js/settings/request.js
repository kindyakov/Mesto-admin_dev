import { buildQueryParams } from "../utils/buildQueryParams.js";
import { api } from "./api.js";

export async function getClients(params = '') {
  try {
    const response = await api.get(`/_main_clients_${buildQueryParams(params)}`)
    if (response.status !== 200) return null
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

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