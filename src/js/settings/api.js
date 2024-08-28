import axios from "axios";

const baseURL = 'https://store-demo-test.ru' // store-franchise.ru

axios.defaults.timeout = 30000

export const api = axios.create({ baseURL })

api.interceptors.response.use(
  response => {
    const [path] = response.config.url.split('/').filter(el => el !== '')

    switch (path) {
      case '_dashboard_warehouse_':
        const [d] = response.data.rented_cnt.filter(obj => +obj.rented == -2)

        if (d) {
          response.data.rented_cnt = response.data.rented_cnt.map(obj => {
            if (+obj.rented == 0) {
              obj.area = obj.area + d.area
              obj.cnt = obj.cnt + d.cnt
              obj.rate = obj.rate + d.rate
            }

            return obj
          })
        }

        break;
      case '_main_rooms_':
        response.data.plan_rooms = response.data.plan_rooms.map(obj => {
          if (+obj.rented == -2) {
            obj.rented = 0
          }
          return obj
        })

        break;
      default:
        break;
    }

    return response;
  },
  error => {
    if (error.response && error.response.status === 401) {
      window.app.auth ?? window.app.auth.logout()
    }

    return Promise.reject(error);
  }
);