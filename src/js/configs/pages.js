const PERMISSIONS = {
	DASHBOARDS: 'can_see_dasboards',
	USERS: 'can_see_users',
	WORKTIME: 'can_see_users_worktime',
	ROOM_PRICES: 'can_see_room_prices',
	TIME_CONTROL: 'needs_time_control'
};

function checkAccess({ tab, content, user }, permission) {
	if (!user?.manager) {
		tab?.classList.add('_none');
		return false;
	}

	if (permission && !user.manager[permission]) {
		tab?.closest('.sidebar__item')?.classList.add('_none');
		return false;
	}

	tab?.classList.remove('_none');
	tab?.closest('.sidebar__item')?.classList.remove('_none');

	return true;
}

function actionDashboards(params) {
	return checkAccess(params, PERMISSIONS.DASHBOARDS);
}

export const pages = {
	'dashboards/clients': {
		path: 'Dashboards/Clients/Clients.js',
		accessCheck: ({ tab, content, user }) => {
			return actionDashboards({ tab, content, user });
		}
	},
	'dashboards/finance': {
		path: 'Dashboards/Finance/Finance.js',
		accessCheck: ({ tab, content, user, ...params }) => {
			return actionDashboards({ tab, content, user, ...params });
		}
	},
	'dashboards/business': {
		path: 'Dashboards/Business/Business.js',
		accessCheck: ({ tab, content, user, ...params }) => {
			return actionDashboards({ tab, content, user, ...params });
		}
	},
	'dashboards/effectiveness': {
		path: 'Dashboards/Effectiveness/Effectiveness.js',
		accessCheck: ({ tab, content, user, ...params }) => {
			let access = actionDashboards({ tab, content, user, ...params });

			if (!user.manager.can_see_effectiveness) {
				tab?.classList.add('_none');
				access = false;
			}

			return access;
		}
	},
	'dashboards/marketing': {
		path: 'Dashboards/Marketing/Marketing.js',
		accessCheck: ({ tab, content, user }) => {
			return actionDashboards({ tab, content, user });
		}
	},
	'dashboards/warehouse': {
		path: 'Dashboards/Warehouse/Warehouse.js',
		accessCheck: ({ tab, content, user }) => {
			let access = actionDashboards({ tab, content, user });

			if (!window.app.warehouse.warehouse_id) {
				tab?.classList.add('_none');
				access = false;
			}

			return access;
		}
	},
	'dashboards/transactions': {
		path: 'Dashboards/Transactions/Transactions.js',
		accessCheck: ({ tab, content, user }) => {
			return actionDashboards({ tab, content, user });
		}
	},
	'dashboards/sales-channels': {
		path: 'Dashboards/SalesChannels/SalesChannels.js',
		accessCheck: ({ tab, content, user }) => {
			return actionDashboards({ tab, content, user });
		}
	},
	'dashboards/indexation': {
		path: 'Dashboards/Indexation/Indexation.js',
		accessCheck: ({ tab, content, user }) => {
			let access = actionDashboards({ tab, content, user });

			if (!window.app.warehouse.warehouse_id) {
				tab?.classList.add('_none');
				access = false;
			}

			return access;
		}
	},
	'dashboards/plan': {
		path: 'Dashboards/Plan/Plan.js',
		accessCheck: ({ tab, content, user }) => {
			return true
		}
	},
	'charging-locks': {
		path: 'ChargingLocks/ChargingLocks.js',
		accessCheck: ({ tab, content, user }) => {
			let access = true;

			if (!window.app.warehouse.warehouse_id) {
				tab?.classList.add('_none');
				access = false;
			}

			return access;
		}
	},
	budgeting: {
		path: 'Budgeting/Budgeting.js',
		accessCheck: ({ tab, content, user }) => {
			let access = true;

			return access;
		}
	},
	users: {
		path: 'Users/Users.js',
		accessCheck: ({ tab, content, user }) => {
			if (!user.manager.can_see_users) {
				tab?.classList.add('_none');
				return false;
			} else {
				tab?.classList.remove('_none');
			}

			return true;
		}
	},
	'working-hours': {
		path: 'WorkingHours/WorkingHours.js',
		accessCheck: ({ tab, content, user, page }) => {
			const list = content.querySelector('.section-list');
			const table = content.querySelector('.section-table');

			if (user.manager.can_see_users_worktime) {
				table?.classList.remove('_none');
			} else {
				table?.classList.add('_none');
			}

			if (user.manager.needs_time_control) {
				list?.classList.remove('_none');
			} else {
				list?.classList.add('_none');
			}

			return true;
		}
	},
	'prices-rooms': {
		path: 'PricesRooms/PricesRooms.js',
		accessCheck: ({ tab, content, user }) => {
			if (!user.manager.can_see_room_prices) {
				tab?.classList.add('_none');
				return false;
			}
			return true;
		}
	},
	forecast: {
		path: 'Forecast/Forecast.js',
		accessCheck: ({ tab, content, user }) => {
			let access = true;

			if (!window.app.warehouse.warehouse_id) {
				tab?.classList.add('_none');
				access = false;
			}

			return access;
		}
	},
	'mesto-plan': {
		path: 'MestoPlan/MestoPlan.js',
		accessCheck: ({ tab, content, user }) => {
			return true;
		}
	},
	'mesto-budget': {
		path: 'MestoBudget/MestoBudget.js',
		accessCheck: ({ tab, content, user }) => {
			return true;
		}
	},
	warehouse: {
		path: 'Warehouse/Warehouse.js',
		accessCheck: ({ tab, content, user }) => {
			let access = true;

			if (!window.app.warehouse.warehouse_id) {
				tab?.classList.add('_none');
				access = false;
			}

			return access;
		}
	},
	locks: {
		path: 'Locks/Locks.js',
		accessCheck: ({ tab, content, user }) => {
			return true;
		}
	},
	rooms: {
		path: 'Rooms/Rooms.js',
		accessCheck: ({ tab, content, user }) => {
			let access = true;
			if (!window.app.warehouse.warehouse_id) {
				tab?.classList.add('_none');
				access = false;
			}

			return access;
		}
	},
	payments: {
		path: 'Payments/Payments.js',
		accessCheck: ({ tab, content, user }) => {
			return true;
		}
	},
	agreements: {
		path: 'Agreements/Agreements.js',
		accessCheck: ({ tab, content, user }) => {
			return true;
		}
	},
	'list-clients': {
		path: 'ListClients/ListClients.js',
		accessCheck: ({ tab, content, user }) => {
			return true;
		}
	},
	'administrations/effectiveness': {
		path: 'Dashboards/Effectiveness/Effectiveness.js',
		accessCheck: ({ tab, content, user, }) => {
			return true;
		}
	},
	'registry/effectiveness': {
		path: 'Dashboards/Effectiveness/Effectiveness.js',
		accessCheck: ({ tab, content, user }) => {
			return true;
		}
	},
	messages: {
		path: 'Messages/Messages.js',
		accessCheck: ({ tab, content, user }) => {
			return true;
		}
	},
	open: {
		path: 'Open/Open.js',
		accessCheck: ({ tab, content, user }) => {
			return true;
		}
	}
};
