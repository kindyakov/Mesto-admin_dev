import axios from "axios";

const baseURL = 'https://store-demo-test.ru' // store-franchise.ru

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