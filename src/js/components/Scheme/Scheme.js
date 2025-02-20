class Scheme {
	constructor(wrapper) {
		this.wrapper = wrapper;
		this.wrapScheme = wrapper.querySelector('.wrap-scheme');
		this.schemes = wrapper.querySelectorAll('.scheme');

		this.currentRented = -1;
		this.numRooms = {};

		this.buttonsFilterScheme = wrapper.querySelectorAll('.btn-filter-scheme');
		this.btnHideLockRoom = wrapper.querySelector('.btn-hide-lock-room');

		this.init();
	}

	init() {
		this.buttonsFilterScheme.length &&
			this.buttonsFilterScheme.forEach(btn =>
				btn.addEventListener('click', e => {
					if (!btn.classList.contains('_active')) {
						this.handleClickFilterScheme(btn);
					}
				})
			);
		this.btnHideLockRoom.addEventListener('click', e => this.handleClickBtnHideLockRoom(e));
	}

	handleClickFilterScheme(btn) {
		const btnActive = this.wrapper.querySelector('.btn-filter-scheme._active');
		const rented = btn.getAttribute('data-rented');

		btn.classList.add('_active');
		btnActive?.classList.remove('_active');

		this.currentRented = rented;
		this.filterCell(rented);
	}

	handleClickBtnHideLockRoom(e) {
		const btn = e.target;
		const isActive = btn.classList.contains('_active');
		btn.classList.toggle('_active', !isActive);

		if (isActive) {
			this.filterCell(this.currentRented);
		} else {
			this.actionsCell(({ cell, cellId }) => {
				const { rented, blocked } = this.numRooms[cellId];

				if (rented !== 0.75 && rented !== 0.95 && rented !== 1 && rented !== 0) return;

				if (!blocked) {
					cell.removeAttribute('data-rented');
				}
			});
		}
	}

	changeActive(floor) {
		this.schemes.forEach((scheme, i) => {
			const wrap = scheme.closest('.wrap-scheme');
			if (floor - 1 === i) {
				wrap.classList.add('_active');
			} else {
				wrap.classList.remove('_active');
			}
		});
	}

	filterCell(_rented) {
		this.actionsCell(({ cell, cellId }) => {
			const room = this.numRooms[+cellId];
			if (!room) {
				return
			}

			const { rented = null, blocked = null } = room

			if (rented === undefined || rented === null) {
				cell.removeAttribute('data-rented');
				return;
			}

			if (this.btnHideLockRoom.classList.contains('_active') && !blocked) {
				cell.removeAttribute('data-rented');
				return;
			}

			if (+_rented === -1) {
				cell.setAttribute('data-rented', rented);
			} else if (+_rented === +rented) {
				cell.setAttribute('data-rented', rented);
			} else {
				cell.removeAttribute('data-rented');
			}
		});
	}

	actionsCell(callback = () => { }) {
		this.cells.forEach(cell => {
			const cellId = cell.getAttribute('data-cell-num');
			callback({ cell, cellId });
		});
	}

	render(scheme, data) {
		if (!this.wrapScheme) return;
		const { plan_rooms } = data;

		this.wrapScheme.innerHTML = scheme;
		this.cells = this.wrapScheme.querySelectorAll('.warehouse__svg-cell');

		this.setNumRooms(plan_rooms);
		this.actionsCell(({ cell, cellId }) => {
			if (this.numRooms[cellId]) {
				cell.setAttribute('data-rented', this.numRooms[cellId].rented);
			} else {
				cell.removeAttribute('data-rented');
			}
		});
	}

	setNumRooms(rooms) {
		this.numRooms = {};
		rooms.forEach(room => (this.numRooms[room.room_name] = room));
	}
}

export default Scheme;
