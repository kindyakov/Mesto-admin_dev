import BaseModal from '../BaseModal.js';
import content from './content.html';

import { agreementHtml } from './html.js';
import { validateClient, validateRequisites } from './validate.js';

import { getClientTotal } from '../../../settings/request.js';
import { api } from '../../../settings/api.js';
import { outputInfo } from '../../../utils/outputinfo.js';
import { renderForm } from '../utils/renderForm.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';

class ModalClient extends BaseModal {
	constructor(options = {}) {
		super(content, {
			cssClass: ['modal-client'],
			...options
		});
		this.userId = null;

		this.validators = {
			client: validateClient,
			passport: null,
			requisites: validateRequisites
		};

		this.init();
	}

	init() {
		if (!this.modalBody) return;
		const forms = this.modalBody.querySelectorAll('form');
		forms.length &&
			forms.forEach(form => {
				const validator = this.validators[form.dataset.validator]?.(form);
				form.validator = validator;
			});

		this.blockItemUserF = this.modalBody.querySelector('.block-item-user-f');
		this.blockItemUserU = this.modalBody.querySelector('.block-item-user-u');
	}

	onEdit(form) {
		const formData = new FormData(form);
		let data = { user_id: this.userId };

		if (formData.get('birthday')) {
			formData.set('birthday', dateFormatter(formData.get('birthday'), 'yyyy-MM-dd'));
		}

		if (formData.get('username')) {
			formData.set('username', formData.get('username').replace(/[+() -]/g, ''));
		}

		formData.delete('flatpickr-month');

		Array.from(formData).forEach(obj => (data[obj[0]] = obj[1]));

		return { client: data };
	}

	renderModal({ client, agreements }) {
		this.renderElements = this.modalBody.querySelectorAll('[data-render]');
		this.attrsModal = this.modalBody.querySelectorAll('[data-modal]');

		this.attrsModal.length &&
			this.attrsModal.forEach(el => {
				el.setAttribute('user-id', client.user_id);
			});

		this.userId = client.user_id;

		this.renderElements.length && this.renderElements.forEach(el => renderForm(el, client));

		this.contentAgreements = this.modalBody.querySelector('.modal-content-agreements');
		this.contentAgreements.innerHTML = '';
		agreements.length &&
			agreements.forEach(agreement => {
				this.contentAgreements.insertAdjacentElement('beforeend', agreementHtml(agreement));
			});

		this.blockItemUserF.classList.add('_none');
		this.blockItemUserU.classList.add('_none');

		if (client.user_type == 'f') {
			this.blockItemUserF.classList.remove('_none');
		} else if (client.user_type == 'u') {
			this.blockItemUserU.classList.remove('_none');
		}
	}

	async editForm(data) {
		try {
			this.loader.enable();
			const response = await api.post('/_edit_client_', data);
			if (response.status !== 200) return;
			outputInfo(response.data);
		} catch (error) {
			console.error(error);
		} finally {
			this.loader.disable();
		}
	}

	async onOpen(params = null) {
		if (!params) return;
		try {
			this.loader.enable();
			let id = '';

			if (params instanceof Element) {
				id = params.getAttribute('user-id');
			} else {
				id = params;
			}

			if (!id) return;

			const data = await getClientTotal(id + '/');
			if (data) {
				this.renderModal(data);
				this.data = data;
			}
		} catch (error) {
			console.error(error);
		} finally {
			this.loader.disable();
		}
	}
}

const modalClient = new ModalClient();

export default modalClient;
