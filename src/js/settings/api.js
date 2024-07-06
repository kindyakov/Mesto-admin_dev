import axios from "axios";

axios.defaults.timeout = 15000

const baseURL = ' https://store-demo-test.ru'

export const api = axios.create({ baseURL })

api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response && error.response.status === 401) {

    }

    return Promise.reject(error);
  }
);