import axios from "axios";

const baseURL = 'http://store-franchise.ru' // store-demo-test.ru

axios.defaults.timeout = 30000

export const api = axios.create({ baseURL })

api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response && error.response.status === 401) {
      window.app.auth ?? window.app.auth.logout()
    }

    return Promise.reject(error);
  }
);