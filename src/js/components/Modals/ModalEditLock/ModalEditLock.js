import BaseModal from "../BaseModal.js"
import content from './content.html'
import { validate } from './validate.js'
import { api } from "../../../settings/api.js"
import SearchLock from "../../SearchLock/SearchLock.js"

class ModalEditLock extends BaseModal {
	constructor(options = {}) {
		super(content, {
			cssClass: ['modal-edit-lock'],
			...options
		})

		this.currentRoom = null
		this.init()
	}

	init() {
		if (!this.modalBody) return
		this.form = this.modalBody.querySelector('.form-edit-lock')
		this.validator = validate(this.form, { container: this.modalBody })

		this.roomNameInput = this.modalBody.querySelector('input[name="room_name"]')
		this.lockIdInput = this.modalBody.querySelector('input[name="lock_id"]')
		this.lockTrigger = this.modalBody.querySelector('.search-lock-trigger')

		this.searchLock = new SearchLock(this.lockTrigger)
		this.searchLock.onSelect = (lock) => {
			this.lockIdInput.value = lock.lock_id
			this.validator.revalidateField(this.lockIdInput)
		}
		this.events()
	}

	events() {
		this.modalBody.addEventListener('click', (e) => {
			if (e.target.closest('.btn-submit')) {
				this.handleSubmit(e)
			}
		})
		this.form.addEventListener('submit', this.handleSubmit.bind(this))
	}

	async open(data) {
		this.resetForm()

		this.currentRoom = data
		if (this.roomNameInput) {
			this.roomNameInput.value = data.room_name || ''
		}

		if (data.lock_num) {
			const lockId = data.lock_id || data.lock_num;
			this.searchLock.selectLock({ lock_id: lockId, lock_num: data.lock_num });
			this.lockIdInput.value = lockId;
		} else {
			this.searchLock.clear()
		}

		super.open()
		await this.fetchUnusedLocks()
	}

	resetForm() {
		this.form.reset()
		this.lockIdInput.value = ''
		this.searchLock.clear()
		this.validator.refresh()
	}

	async fetchUnusedLocks() {
		try {
			const response = await api.get('/_get_unused_locks_')
			if (response.status === 200) {
				const locks = response.data.locks || response.data || []
				this.searchLock.setLocks(locks)
			}
		} catch (e) {
			console.error(e)
		}
	}
	handleSubmit(e) {
		e.preventDefault()
		this.validator.revalidate().then(isValid => {
			if (isValid) this.sendData()
		})
	}

	async sendData() {
		this.loader.enable()
		const lockId = this.lockIdInput.value
		try {
			const response = await api.post('/_set_lock_for_room_', {
				room_id: this.currentRoom.room_id,
				lock_id: +lockId
			})
			if (response.status === 200) {
				window.app.notify.show(response.data)
				this.close()
				this.onSave()
			}
		} catch (e) {
			console.error(e)
		} finally {
			this.loader.disable()
		}
	}
}
export default new ModalEditLock()