import modalAuth from "../Modals/ModalAuth/ModalAuth.js"
import { validate } from "./validate.js"
import { api } from "../../settings/api.js"
import { Loader } from "../../modules/myLoader.js"
import { getCookie, deleteCookie } from "../../utils/getCookie.js"

// Constants
const AUTH_ENDPOINTS = {
  LOGIN: '/_admin_login_'
};

const COOKIE_KEYS = {
  TOKEN: 'token',
  MANAGER: 'manager'
};

const ERROR_MESSAGES = {
  AUTH_FAILED: 'Ошибка при авторизации',
  TOKEN_EXPIRED: 'Сессия истекла, пожалуйста авторизуйтесь снова',
  NETWORK_ERROR: 'Ошибка сети, проверьте подключение'
};

/**
 * @typedef {Object} AuthOptions
 * @property {string|null} redirect - URL для редиректа после успешной авторизации
 * @property {Function} onAuth - Callback после успешной авторизации
 * @property {Function} onInit - Callback после инициализации
 */

/**
 * Класс управления аутентификацией
 */
class Auth {
  /**
   * @param {AuthOptions} options 
   */
  constructor(options = {}) {
    let defaultOptions = {
      redirect: null,
      onAuth: () => { },
      onInit: () => { }
    }

    this.options = Object.assign(defaultOptions, options)
    this.notify = this.options.notify
    this.modal = modalAuth

    this.form = this.modal.modalBody.querySelector('.form-authorization')

    if (!this.form) return

    this.validator = validate(this.form)

    this.loader = new Loader(document.querySelector('.modal-auth .modal__body'))
    this.mainLoader = options.mainLoader || document.querySelector('.body-loader')

    this.isAuth = false
    this.user = null
    this.currentDate = new Date()

    this.onAuth = this.options.onAuth
    this.onInit = this.options.onInit

    this.init()
  }

  init() {
    this.isAuth = this.checkAuth()
    this.events()
    this.onInit(this.isAuth)
  }

  events() {
    this.form && this.form.addEventListener('submit', this.submit.bind(this))
    document.addEventListener('click', e => {
      if (e.target.closest('.btn-exit')) {
        this.logout()
      }
    })
  }

  submit() {
    if (!this.validator.isValid) return
    const formData = new FormData(this.form)
    formData.set('username', formData.get('username').replace(/[+() -]/g, ''))

    this.auth(formData)
  }

  checkAuth() {
    const token = getCookie('token')
    let manager = {}

    try {
      //manager = getCookie('manager') ? JSON.parse(getCookie('manager')) : {}
      manager = localStorage.getItem('manager') ? JSON.parse(localStorage.getItem('manager')) : {}
    }
    catch (error) {
      console.log(error)
      manager = {}
    }

    let isAuth = Boolean(token && token.startsWith('Bearer'))
    
    if (isAuth) {
      const tokenData = JSON.parse(atob(token.split('.')[1]))
      const tokenExpiration = new Date(tokenData.exp * 1000)
      this.user = { ...tokenData, manager }

      if (this.currentDate > tokenExpiration) {
        deleteCookie('token');
        isAuth = false
        this.modal.open()
      } else {
        api.defaults.headers.Authorization = token
        isAuth = true
        this.startExpirationTimer(tokenExpiration)
        this.modal.close()
      }
    } else {
      this.modal.open()
    }

    this.disableLoader()

    return isAuth
  }

  enableLoader() {
    this.mainLoader.classList.add('_load')
  }

  disableLoader() {
    this.mainLoader.classList.remove('_load')
  }

  startExpirationTimer(tokenExpiration, onExpireCallback = () => this.logout()) {
    const timeUntilExpiration = tokenExpiration - this.currentDate
    let timer

    if (timeUntilExpiration > 0) {
      timer = setTimeout(() => {
        clearTimeout(timer)
        onExpireCallback()
      }, timeUntilExpiration);
    } else {
      clearTimeout(timer)
      // Если токен уже истек, вызываем callback сразу
      onExpireCallback();
    }
  }

  logout() {
    deleteCookie('token');
    deleteCookie('manager');
    this.allClose()
    this.modal.open()
    this.isAuth = false

    const modalMap = this.options.modalMap

    for (const key in modalMap) {
      modalMap[key]?.modal.close()
    }

    this.notify.show({
      msg: ERROR_MESSAGES.TOKEN_EXPIRED,
      msg_type: 'warning'
    });
  }

  allClose() {
    const modalsOpen = document.querySelectorAll('.modal._active')
    modalsOpen.length && modalsOpen.forEach(modal => {
      modal.classList.remove('_active')
    })
  }

  /**
   * Установка cookies с параметрами безопасности
   * @private
   */
  #setCookies(token, manager, expiration) {
    const secureCookieOptions = `max-age=${expiration}; path=/; secure; samesite=strict`;
    document.cookie = `${COOKIE_KEYS.TOKEN}=Bearer ${token}; ${secureCookieOptions}`;
    //document.cookie = `${COOKIE_KEYS.MANAGER}=${JSON.stringify(manager)}; ${secureCookieOptions}`;
    localStorage.setItem(COOKIE_KEYS.MANAGER,JSON.stringify(manager))
  }

  /**
   * Обработка ошибок аутентификации
   * @private
   */
  #handleAuthError(error) {
    console.error(ERROR_MESSAGES.AUTH_FAILED, error);
    this.notify.show({
      msg: error.message || ERROR_MESSAGES.AUTH_FAILED,
      msg_type: 'error'
    });
  }

  /**
   * Выполнение запроса аутентификации
   * @private
   */
  async #performAuth(formData) {
    try {
      return await api.post(AUTH_ENDPOINTS.LOGIN, formData);
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error(ERROR_MESSAGES.AUTH_FAILED);
      }

      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  /**
   * Обработка ответа аутентификации
   * @private
   */
  async #handleAuthResponse(response) {
    if (response.status !== 200) return;

    const { msg, msg_type, access_token, expiration_time, manager } = this.user = response.data;

    this.notify.show(response.data);

    if (msg_type === 'success') {
      this.isAuth = true;
      api.defaults.headers.Authorization = `Bearer ${access_token}`;

      this.#setCookies(access_token, manager, expiration_time);
      this.modal.close();
      this.startExpirationTimer(new Date(this.currentDate.getTime() + expiration_time * 1000));
      this.onAuth(response.data);

      if (this.options.redirect) {
        document.location.pathname = this.options.redirect;
      }
    }
  }

  /**
   * Аутентификация пользователя
   * @param {FormData} formData 
   */
  async auth(formData) {
    try {
      this.loader.enable()
      const response = await this.#performAuth(formData);
      await this.#handleAuthResponse(response);
    } catch (error) {
      this.#handleAuthError(error);
      throw error
    } finally {
      this.loader.disable()
    }
  }
}

export default Auth