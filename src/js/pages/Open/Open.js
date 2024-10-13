import Page from "../Page.js"
import { api } from '../../settings/api.js'
import { buildQueryParams } from "../../utils/buildQueryParams.js";

class Open extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [],
      page: 'open'
    });

    this.opens = {
      barrier: () => this.open('_open_barrier_'),
      gates: () => this.open('_open_gates_'),
      door: () => this.open('_open_door_'),
    }

    this.notify = window.app.notify
    this.warehouse = window.app.warehouse

    this.buttons = this.wrapper.querySelectorAll('.access-storage-room button')
    this.buttons.length && this.buttons.forEach(btn => {
      let open = btn.getAttribute('open') || null
      if (open) {
        btn.addEventListener('click', () => this.opens[open]())
      }
    })
  }

  async open(rout) {
    try {
      this.loader.enable()
      const response = await api.get(`/${rout}${buildQueryParams({ warehouse_id: this.warehouse.warehouse_id })}`)
      if (response.status !== 200) return
      this.notify.show(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default Open