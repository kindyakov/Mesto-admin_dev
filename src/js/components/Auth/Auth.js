import { validate } from "./validate.js"
import { outputInfo } from "../../utils/outputinfo.js"
import { api } from "../../settings/api.js"
import { Loader } from "../../modules/myLoader.js"
import { Modal } from "../../modules/myModal.js"
import { getCookie, deleteCookie } from "../../utils/getCookie.js"

class Auth {
  constructor(options) {
    let defaultOptions = {
      redirect: null,
      onAuth: () => { },
      onInit: () => { }
    }

    this.options = Object.assign(defaultOptions, options)

    this.form = document.querySelector('.form-authorization')
    if (!this.form) return

    this.validator = validate(this.form)

    this.modal = new Modal({ unique: 'modal-auth', isClose: false, isOpen: true })
    this.loader = new Loader(document.querySelector('.modal-auth .modal__body'))
    this.mainLoader = document.querySelector('.body-loader')

    this.isAuth = false
    this.resData = null
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
  }

  submit() {
    if (!this.validator.isValid) return
    const formData = new FormData(this.form)
    formData.set('username', formData.get('username').replace(/[+() -]/g, ''))

    this.auth(formData)
  }

  checkAuth() {
    const token = getCookie('token')
    let isAuth = Boolean(token && token.startsWith('Bearer'))

    if (isAuth) {
      const tokenData = JSON.parse(atob(token.split('.')[1]))
      const tokenExpiration = new Date(tokenData.exp * 1000)

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
    this.modal.open()
    this.isAuth = false
  }

  async auth(formData) {
    try {
      this.loader.enable()
      const response = await api.post('/_admin_login_', formData)

      if (response.status !== 200) return

      const { msg, msg_type, access_token, expiration_time } = this.resData = response.data

      outputInfo(response.data)

      if (msg_type === 'success') {
        this.isAuth = true
        api.defaults.headers.Authorization = `Bearer ${access_token}`
        document.cookie = `token=Bearer ${access_token}; max-age=${expiration_time}; path=/`;
        this.modal.close()
        this.startExpirationTimer(new Date(this.currentDate.getTime() + expiration_time * 1000))
        this.onAuth(response.data)

        if (this.options.redirect) {
          document.location.pathname = this.options.redirect
        }
      }
    } catch (error) {
      console.error('Ошибка при авторизации', error.message)
    } finally {
      this.loader.disable()
    }
  }
}

export default Auth