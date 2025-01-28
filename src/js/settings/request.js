import axios from 'axios';
import { api } from './api.js';
import { buildQueryParams } from '../utils/buildQueryParams.js';
import { getFormattedDate } from '../utils/getFormattedDate.js';
import { getCurrentTimeString } from '../utils/getCurrentTimeString.js';

function getCreate(rout) {
	return async function (params = {}) {
		try {
			const response = await api.get(`${rout}${buildQueryParams(params)}`);
			if (response.status !== 200) return null;
			return response.data;
		} catch (error) {
			window.app.notify.show({
				msg: `Что-то пошло не так!<br>Ошибка: ${error.message}`,
				msg_type: 'error'
			});
			console.error(error);
			throw error;
		}
	};
}

function getCreateTotal(rout) {
	return async function (id) {
		try {
			const response = await api.get(`${rout}/${id}`);
			if (response.status !== 200) return null;
			return response.data;
		} catch (error) {
			window.app.notify.show({
				msg: `Что-то пошло не так!<br>Ошибка: ${error.message}`,
				msg_type: 'error'
			});
			console.error(error);
			throw error;
		}
	};
}

function postCreate(rout) {
	return async function (data = {}) {
		try {
			const response = await api.post(rout, data);
			if (response.status !== 200) return null;
			return response.data;
		} catch (error) {
			window.app.notify.show({
				msg: `Что-то пошло не так!<br>Ошибка: ${error.message}`,
				msg_type: 'error'
			});
			console.error(error);
			throw error;
		}
	};
}

function downloadCreate(rout, opts = {}) {
	const options = {
		nameFile: `Файл от`,
		...opts
	};

	return async function (data = {}) {
		try {
			const response = await api.post(`${rout}`, data, { responseType: 'blob' });
			if (response.status !== 200) return null;
			if (response.data.msg_type) {
				window.app.notify.show(response.data);
				return response.data;
			} else {
				const blob = new Blob([response.data], { type: response.headers['content-type'] });
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = `${options.nameFile} ${getFormattedDate()}_${getCurrentTimeString()}.xlsx`;
				link.click();
				URL.revokeObjectURL(url);
				return true;
			}
		} catch (error) {
			window.app.notify.show({
				msg: `Что-то пошло не так!<br>Ошибка: ${error.message}`,
				msg_type: 'error'
			});
			console.error(error);
			throw error;
		}
	};
}

// ============================================================================>
export const getClients = getCreate('/_main_clients_');

export const getPayments = getCreate('/_main_payments_');

export const getAgreements = getCreate('/_main_agreements_');

export const getDashboardClient = getCreate('/_dashboard_client_');

export const getDashboardWarehouse = getCreate('/_dashboard_warehouse_');

export const getDashboardFinance = getCreate('/_dashboard_finance_');

export const getDashboardMarketing = getCreate('/_dashboard_marketing_');

export const getFuturePayments = getCreate('/_get_future_payments_');

export const getRooms = getCreate('/_main_rooms_/');

export const getWarehousesInfo = getCreate('/_get_warehouses_info_for_admin_');

export const getOldClient = getCreate('/_get_old_client_data_');

export const getMovingOutClients = getCreate('/_get_moving_out_clients_');

export const getNonApprovedClients = getCreate('/_get_nonapproved_clients_');

export const getLocksPower = getCreate('/_get_locks_power_/');

export const getManagersList = getCreate('/_get_managers_list_');

export const getFinancePlan = getCreate('/_get_finance_plan_');

export const getMessagesHistory = getCreate('/_get_messages_history_');

export const getTimeControlInfo = getCreate('/_get_time_control_info_');

export const getWorkersManager = getCreate('/_get_workers_');

export const getSalesPlan = getCreate('/_get_sales_plan_');

export const getSales = getCreate('/_get_sales_');

export const getSaleChannels = getCreate('/_get_sale_channels_');

export const getSaleChannelsExpenses = getCreate('/_get_sale_channels_expenses_');

export const getSaleChannelsStats = getCreate('/_get_sale_channels_stats_');

export const getSaleChannelsLeads = getCreate('/_get_sale_channels_leads_');

export const getSalesConversionRates = getCreate('/_get_sales_conversion_rates_');

export const getIndexations = getCreate('/_get_indexations_');

export const getChangePrices = getCreate('/_get_change_prices_');
// ============================================================================>

export const postFuturePayments = postCreate('/_get_future_payments_');

export const formNewAgreementByAdmin = postCreate('/_form_new_agreement_by_admin_');

// ============================================================================>

export const getClientTotal = getCreateTotal('/_get_client_total_');

export const getAgreementTotal = getCreateTotal('/_get_agreement_total_');

export const getScheme = async (warehouse, floor) => {
	try {
		const response = await axios.get(
			`${location.origin}/assets/schemes/${warehouse}/${floor}.html`
		);
		if (response.status !== 200) return null;
		return response.data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
// ============================================================================>

export const downloadPayments = downloadCreate('/download_payments', { nameFile: `Платежи от` });

export const downloadAgreement = downloadCreate('/download_reestr', { nameFile: `Договора от` });

export const downloadClient = downloadCreate('/download_clients', { nameFile: `Клиенты от` });

export const downloadFuturePayments = downloadCreate('/download_future_payments', {
	nameFile: `Предстоящие плановые платежи от`
});

// /download_agr
export async function downloadAgr(room_id) {
	try {
		const response = await api.post(`/download_agr/${room_id}`, { responseType: 'blob' });
		if (response.status !== 200) return;
		if (response.data.msg_type) {
			window.app.notify.show(response.data);
		} else {
			const blob = new Blob([response.data], { type: response.headers['content-type'] });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `Договор от ${getFormattedDate()}_${getCurrentTimeString()}.xlsx`;
			link.click();
			URL.revokeObjectURL(url);
		}
	} catch (error) {
		console.error(error);
		throw error;
	}
}
