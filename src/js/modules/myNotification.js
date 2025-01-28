const baseOptions = {
	msg: 'Сообщение ...',
	msg_type: 'info',
	duration: 5000,
	gap: 10,
	isConfirm: false,
	onClick() {},
	animateHide: [
		{ transform: 'scale(1)', opacity: '1' },
		{ transform: 'scale(0)', opacity: '0' }
	]
};

export class Notification {
	constructor(options = {}) {
		this.container = document.querySelector('.notify-container');

		this.defaultOptions = Object.assign({}, baseOptions, options);
		this.notifications = [];

		this.init();
	}

	init() {
		if (!this.container) {
			this.container = document.querySelector('.notify-container') || this.createContainer();
		}
	}

	createContainer() {
		const container = document.createElement('div');
		container.className = 'notify-container';
		document.body.appendChild(container);
		return container;
	}

	show(opts = {}, callback = () => {}) {
		const options = Object.assign({}, this.defaultOptions, opts);
		const { msg, msg_type, duration, isConfirm, ...other } = options;

		const notification = document.createElement('div');

		if (isConfirm) {
			notification.className = `notify confirm absolute`;
			notification.innerHTML = `
        <span>${msg}</span>  
        <div>
          <button class="btn-confirm-no">Нет</button>
          <button class="btn-confirm-yes">Да</button>
        </div>`;
		} else {
			notification.className = `notify ${msg_type} absolute`;
			notification.innerHTML = msg;
		}

		this.container.insertAdjacentElement('afterbegin', notification);
		options.notification = notification;

		isConfirm && this.handlerButtons(options);

		requestAnimationFrame(() => {
			notification.classList.add('show');
			this.updatePositions(options);
		});

		setTimeout(() => {
			!isConfirm && this.hide(options);
		}, duration);
	}

	handlerButtons({ notification, animateHide, onClick, ...other }) {
		const yesButton = notification.querySelector('.btn-confirm-yes');
		const noButton = notification.querySelector('.btn-confirm-no');

		const handleConfirm = isConfirmed => {
			if (onClick && typeof onClick === 'function') {
				onClick(isConfirmed);
			}
			yesButton.removeEventListener('click', onYesClick);
			noButton.removeEventListener('click', onNoClick);

			this.hide({ notification, animateHide, ...other });
		};

		const onYesClick = () => handleConfirm(true);
		const onNoClick = () => handleConfirm(false);

		yesButton.addEventListener('click', onYesClick);
		noButton.addEventListener('click', onNoClick);
	}

	hide({ notification, animateHide, gap }) {
		const [current] = this.notifications.filter(obj => obj.notification === notification);
		this.notifications = this.notifications.filter(obj => obj.notification !== notification);

		current?.notification
			.animate(animateHide, { duration: 300, easing: 'ease', fill: 'forwards' })
			.addEventListener('finish', () => {
				notification.remove();
				this.updatePositions({ notification: null, gap });
			});
	}

	updatePositions({ notification, gap }) {
		notification && this.notifications.unshift({ notification, top: 0 });

		const newNotifications = [];

		this.notifications.forEach((item, i) => {
			const prevItem = newNotifications[i - 1] || null;
			const prevRect = prevItem?.notification.getBoundingClientRect();
			const top = prevItem ? prevItem.top + prevRect.height + gap : 0;

			item.notification.style.top = `${top}px`;

			newNotifications.push({ ...item, top });
		});

		this.notifications = newNotifications;
	}
}
