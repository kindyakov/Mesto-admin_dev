function actionDashboards({ tab, content, user }) {  
  if (!user.manager.can_see_dasboards) {
    console.log(tab?.closest('.sidebar__item')?.classList.add('_none'))
    return false
  }

  return true
}

export const pages = {
  'dashboards/clients': {
    path: 'Dashboards/Clients/Clients.js',
    accessCheck: ({ tab, content, user }) => { return actionDashboards({ tab, content, user }) }
  },
  'dashboards/finance': {
    path: 'Dashboards/Finance/Finance.js',
    accessCheck: ({ tab, content, user }) => { return actionDashboards({ tab, content, user }) }
  },
  'dashboards/marketing': {
    path: 'Dashboards/Marketing/Marketing.js',
    accessCheck: ({ tab, content, user }) => { return actionDashboards({ tab, content, user }) }
  },
  'dashboards/warehouse': {
    path: 'Dashboards/Warehouse/Warehouse.js',
    accessCheck: ({ tab, content, user }) => { return actionDashboards({ tab, content, user }) }
  },
  'dashboards/transactions': {
    path: 'Dashboards/Transactions/Transactions.js',
    accessCheck: ({ tab, content, user }) => { return actionDashboards({ tab, content, user }) }
  },
  'dashboards/sales-channels': {
    path: 'Dashboards/SalesChannels/SalesChannels.js',
    accessCheck: ({ tab, content, user }) => { return actionDashboards({ tab, content, user }) }
  },
  'charging-locks': {
    path: 'ChargingLocks/ChargingLocks.js',
    accessCheck: ({ tab, content, user }) => { return true }
  },
  'users': {
    path: 'Users/Users.js',
    accessCheck: ({ tab, content, user }) => {
      if (!user.manager.can_see_users) {
        tab?.classList.add('_none')
        return false
      }
      return true
    }
  },
  'working-hours': {
    path: 'WorkingHours/WorkingHours.js',
    accessCheck: ({ tab, content, user, page }) => {
      const list = content.querySelector('.section-list')
      const table = content.querySelector('.section-table')

      if (user.manager.can_see_users_worktime) {
        table?.classList.remove('_none')
      }

      if (user.manager.needs_time_control) {
        list?.classList.remove('_none')
      }

      return true
    }
  },
  'prices-rooms': {
    path: 'PricesRooms/PricesRooms.js',
    accessCheck: ({ tab, content, user }) => {
      if (!user.manager.can_see_room_prices) {
        tab?.classList.add('_none')
        return false
      }
      return true
    }
  },
  'forecast': {
    path: 'Forecast/Forecast.js',
    accessCheck: ({ tab, content, user }) => { return true }
  },
  'mesto-plan': {
    path: 'MestoPlan/MestoPlan.js',
    accessCheck: ({ tab, content, user }) => { return true }
  },
  'mesto-budget': {
    path: 'MestoBudget/MestoBudget.js',
    accessCheck: ({ tab, content, user }) => { return true }
  },
  'rooms': {
    path: 'Rooms/Rooms.js',
    accessCheck: ({ tab, content, user }) => { return true }
  },
  'payments': {
    path: 'Payments/Payments.js',
    accessCheck: ({ tab, content, user }) => { return true }
  },
  'agreements': {
    path: 'Agreements/Agreements.js',
    accessCheck: ({ tab, content, user }) => { return true }
  },
  'list-clients': {
    path: 'ListClients/ListClients.js',
    accessCheck: ({ tab, content, user }) => { return true }
  },
  'messages': {
    path: 'Messages/Messages.js',
    accessCheck: ({ tab, content, user }) => { return true }
  },
  'open': {
    path: 'Open/Open.js',
    accessCheck: ({ tab, content, user }) => { return true }
  }
};