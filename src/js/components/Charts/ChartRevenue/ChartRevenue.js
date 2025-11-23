import BaseChart from '../BaseChart.js';
import merge from 'lodash.merge';
import { api } from '../../../settings/api.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { createCalendar } from '../../../settings/createCalendar.js';
import { getFinancePlan, } from '../../../settings/request.js';
import { Loader } from '../../../modules/myLoader.js';

function formatePrice(value) {
	if (!value) return '';
	const units = ['', 'тыс.', 'млн.', 'млрд.', 'трлн.'];
	let unitIndex = 0;

	while (value >= 1000 && unitIndex < units.length - 1) {
		value /= 1000;
		unitIndex++;
	}

	return value.toFixed(0) + ' ' + units[unitIndex];
}

class ChartRevenue extends BaseChart {
	constructor(ctx, addOptions) {
		const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
		gradient.addColorStop(0, 'rgba(60, 80, 224, 0.1)');
		gradient.addColorStop(1, 'rgba(60, 80, 224, 0.2)');

		const wpChart = ctx.closest('.wp-chart');
		const tooltipEl = document.createElement('div');
		tooltipEl.style.opacity = '0';
		tooltipEl.style.position = 'absolute';
		tooltipEl.style.pointerEvents = 'none';

		const defaultOptions = {
			type: 'line',
			data: {
				labels: [],
				datasets: [
					{
						label: 'Факт',
						data: [],
						borderColor: '#19D06D',
						color: '#19D06D',
						pointBackgroundColor: '#fff',
						pointRadius: 2,
						fill: true,
						tension: 0.6
					},
					{
						label: 'План',
						data: [],
						borderColor: '#3D50E0',
						color: '#3D50E0',
						pointBackgroundColor: '#fff',
						backgroundColor: gradient,
						pointRadius: 2,
						fill: true,
						tension: 0.6
					}
				]
			},
			options: {
				scales: {
					y: {
						ticks: {
							font: {
								size: 11
							},
							callback: function (value, index, values) {
								return formatePrice(value);
							}
						}
					},
					x: {
						ticks: {
							minRotation: 60,
							font: {
								size: 10
							}
						}
					}
				},
				plugins: {
					tooltip: {
						enabled: false,
						position: 'average',
						mode: 'index', // Показ по оси X, не по точкам
						intersect: false, // Чтобы tooltip показывался вне пересечения с точкой
						external: (context) => {
							const { chart, tooltip } = context;

							if (!tooltipEl) return;

							if (tooltip.opacity === 0) {
								tooltipEl.style.opacity = 0;
								return;
							}

							const dataI = tooltip.dataPoints[0].dataIndex;
							tooltipEl.style.opacity = 1;
							this.onPosExternal(tooltipEl, chart, tooltip, dataI);
							this.onExternal(tooltipEl, chart, tooltip, dataI);
						}
					}
				},
				hover: {
					mode: 'index', // При наведении - также по оси X
					intersect: false
				}
			}
		};

		super(ctx, merge({}, defaultOptions, addOptions));
		this.ctx = ctx;
		this.dataPlan = {};
		this.planMonthValue = this.wpChart.querySelector('.plan-month-value');

		this.onExternal = this.onExternal.bind(this)
		this.tooltipEl = tooltipEl;

		// Устанавливаем HTML содержимое и добавляем в DOM
		this.tooltipEl.innerHTML = this.createTooltipHTML();
		this.wpChart.appendChild(this.tooltipEl);

		this.chartBlock = this.wpChart.closest('.chart')
		this.form = this.chartBlock.querySelector('.form-chart-revenue-filter')
		this.checkbox = this.form.querySelector('[type="checkbox"]')

		// Свойства для сравнения данных
		this.comparisonData = null;

		this.calendars = createCalendar(this.form.querySelector('.input-date-chart-revenue'), {
			mode: 'range',
			dateFormat: 'd. M, Y',
			defaultDate: this.app.defaultDate,
			onChange: (selectedDates, dateStr, instance) => {
				const [nameOne, nameTwo] = instance.element.name.split(',')

				if (selectedDates.length === 2) {
					const params = {
						warehouse_id: this.app.warehouse.warehouse_id,
						[nameOne]: dateFormatter(selectedDates[0], 'yyyy-MM-dd'),
						[nameTwo]: dateFormatter(selectedDates[1], 'yyyy-MM-dd')
					}
					// Сохраняем queryParams для использования в updateWidgets
					this.queryParams = {
						start_date: params[nameOne],
						end_date: params[nameTwo]
					};

					this.updateChartData(params);
				}
			}
		});

		this.loaderForm = new Loader(this.form, {
			styleLoader: 'width: 25px; height: 25px; border-width: 2px;'
		});

		this.checkbox.addEventListener('change', () => {
			this.toggleComparison(this.checkbox.checked);
		});

		const btnSetPlan = this.wpChart.querySelector('.btn-set-plan');
		btnSetPlan.addEventListener('click', () => this.handleClickBtnSetPlan());
	}

	calc(dataDashboard, finance_planfact) {
		const deltaValue = this.wpChart.querySelector('.delta-value');

		const [currentD] = finance_planfact.filter(
			obj => new Date(obj.data).toDateString() == new Date().toDateString()
		);
		this.dataPlan = currentD ? currentD : finance_planfact.at(-1);

		const fact = this.dataPlan.revenue_accumulated || 0;
		const plan = this.dataPlan.revenue_accumulated_planned || 0;
		const delta = fact - plan;

		this.wpChart.querySelector('.fact-value').innerText = formattingPrice(fact);
		this.wpChart.querySelector('.plan-value').innerText = formattingPrice(plan);
		this.planMonthValue.value = formattingPrice(
			finance_planfact.at(-1).revenue_accumulated_planned
		);
		deltaValue.innerText = formattingPrice(delta);

		if (delta > 0) {
			deltaValue.classList.add('text-success');
		} else if (delta == 0) {
			deltaValue.classList.add('text-warning');
		} else {
			deltaValue.classList.add('text-error');
		}
	}

	// Добавление данных сравнения в график
	addComparisonData(financeByWarehouses) {
		if (!financeByWarehouses || !financeByWarehouses.length) return;

		const { finance_planfact } = financeByWarehouses.filter(
			obj => obj.warehouse.warehouse_id == this.app.warehouse.warehouse_id
		)[0] || {};

		// Градиенты для данных сравнения
		const gradientOrange = this.createLinearGradient('rgba(255, 165, 0, 0.1)', 'rgba(255, 165, 0, 0.2)');
		const gradientGray = this.createLinearGradient('rgba(169, 169, 169, 0.1)', 'rgba(169, 169, 169, 0.2)');

		// Если datasets сравнения уже существуют, обновляем их
		if (this.chart.data.datasets.length > 2) {
			this.chart.data.datasets[2].data = finance_planfact.length
				? finance_planfact.map(obj => obj.revenue_accumulated)
				: [];
			this.chart.data.datasets[3].data = finance_planfact.length
				? finance_planfact.map(obj => obj.revenue_accumulated_planned)
				: [];
		} else if (this.chart.data.datasets.length === 2) {
			// Создаем новые datasets для сравнения
			this.chart.data.datasets.push(
				{
					label: 'Факт (сравнение)',
					data: finance_planfact.length
						? finance_planfact.map(obj => obj.revenue_accumulated)
						: [],
					borderColor: '#FF00D0',
					color: '#FF00D0',
					pointBackgroundColor: '#fff',
					backgroundColor: gradientGray,
					pointRadius: 2,
					fill: true,
					tension: 0.6,
					hidden: true
				},
				{
					label: 'План (сравнение)',
					data: finance_planfact.length
						? finance_planfact.map(obj => obj.revenue_accumulated_planned)
						: [],
					borderColor: '#FFA500',
					color: '#FFA500',
					pointBackgroundColor: '#fff',
					backgroundColor: gradientOrange,
					pointRadius: 2,
					fill: true,
					tension: 0.6,
					hidden: true
				},
			);
		}

		this.chart.update();
	}

	// Удаление данных сравнения из графика
	removeComparisonData() {
		// Удаляем datasets сравнения если они есть
		if (this.chart.data.datasets.length > 2) {
			this.chart.data.datasets.splice(2);
		}

		this.chart.update();
	}

	// Переключение режима сравнения
	toggleComparison(isEnabled) {
		if (isEnabled && this.comparisonData) {
			this.addComparisonData(this.comparisonData);
			// Показываем datasets сравнения
			if (this.chart.data.datasets.length > 2) {
				this.chart.data.datasets[2].hidden = false;
				// this.chart.data.datasets[3].hidden = false;
			}
		} else {
			// Скрываем datasets сравнения вместо удаления
			if (this.chart.data.datasets.length > 2) {
				this.chart.data.datasets[2].hidden = true;
				// this.chart.data.datasets[3].hidden = true;
			}
		}
		this.chart.update();
	}

	// Обновление данных для сравнения при изменении дат
	async updateChartData(params) {
		try {
			this.loaderForm.enable()
			console.log(params)

			const response = await Promise.all(
				this.app.warehouses.map(warehouse => getFinancePlan({ ...params, warehouse_id: warehouse.warehouse_id, }))
			);
			this.comparisonData = response.map((item, i) => ({
				...item,
				warehouse: this.app.warehouses[i]
			}));
			this.toggleComparison(this.checkbox.checked);
		} catch (error) {
			console.error('Error:', error);
		} finally {
			this.loaderForm.disable()
		}
	}

	handleClickBtnSetPlan() {
		if (this.planMonthValue.value) {
			this.planMonthValue.style.backgroundColor = '';
			this.setFinancePlan({
				revenue_planned: this.planMonthValue.value.replace(/\D/g, ''),
				data: this.dataPlan.data,
				month_or_day: 'month',
				warehouse_id: this.app.warehouse.warehouse_id
			});
		} else {
			this.planMonthValue.style.backgroundColor = '#ffdbdb';
		}
	}

	createTooltipHTML() {
		return `
			<div class="flex flex-col gap-1">
				<div class="flex gap-1 items-start">
					<div class="sklad flex flex-col gap-0.5 items-start text-left tooltip-item">
					</div>
					<div class="revenue flex flex-col gap-0.5 items-start text-left tooltip-item">
					</div>
				</div>
				<div class="flex gap-1 items-start comparison hidden">
					<div class="sklad-comparison flex flex-col gap-0.5 items-start text-left tooltip-item" style="border-color: #FF00D0;">
					</div>
					<div class="revenue-comparison flex flex-col gap-0.5 items-start text-left tooltip-item" style="border-color: #FF00D0;">
					</div>
				</div>
			</div>	
    `;
	}

	onExternal(tooltipEl, chart, tooltip, dataI) {
		if (!this.financePlanFact || !this.financePlanFact.length) return;
		// formattingPrice(parseFloat(el.innerText));
		const skladBlock = tooltipEl.querySelector('.sklad');
		const revenueBlock = tooltipEl.querySelector('.revenue');

		const comparisonSection = tooltipEl.querySelector('.comparison');
		const skladBlockC = comparisonSection.querySelector('.sklad-comparison');
		const revenueBlockC = comparisonSection.querySelector('.revenue-comparison');

		skladBlock.innerHTML = '';
		revenueBlock.innerHTML = '';
		skladBlockC.innerHTML = '';
		revenueBlockC.innerHTML = '';

		const currentData = this.financePlanFact[dataI]

		if (this.financeByWarehouses) {
			this.financeByWarehouses.forEach(({ finance_planfact, warehouse }) => {
				if (warehouse.warehouse_id === 0) return
				skladBlock.innerHTML += `
						<div class="">${warehouse.warehouse_short_name}: ${formattingPrice(finance_planfact[dataI].revenue_accumulated)}</div>
					`;
			});
		}

		if (currentData) {
			revenueBlock.innerHTML = `
				<div class="">Факт: ${formattingPrice(currentData.revenue_accumulated)}</div>
				<div class="">План: ${formattingPrice(currentData.revenue_accumulated_planned)}</div>
			`;
		}

		// Обработка данных сравнения
		if (this.chart.data.datasets.length > 2 && this.comparisonData.length && this.checkbox.checked) {
			const [comparisonFinance] = this.comparisonData.filter(
				({ warehouse }) => warehouse.warehouse_id === this.app.warehouse.warehouse_id)

			if (!comparisonFinance || !comparisonFinance.finance_planfact || !comparisonFinance.finance_planfact[dataI]) {
				comparisonSection.classList.add('hidden');
				return
			}

			this.comparisonData.forEach(({ finance_planfact, warehouse }) => {
				if (warehouse.warehouse_id === 0) return
				skladBlockC.innerHTML += `
						<div class="">${warehouse.warehouse_short_name}: ${formattingPrice(finance_planfact[dataI].revenue_accumulated)}</div>
					`;
			});

			revenueBlockC.innerHTML += `
						<div class="">Факт: ${formattingPrice(comparisonFinance.finance_planfact[dataI].revenue_accumulated)}</div>
						<div class="">План: ${formattingPrice(comparisonFinance.finance_planfact[dataI].revenue_accumulated_planned)}</div>
					`;

			comparisonSection.classList.remove('hidden');
		} else {
			comparisonSection.classList.add('hidden');
		}
	}

	render([dataDashboard, { finance_planfact = undefined }]) {
		if (!finance_planfact) return
		this.chart.data.labels = finance_planfact.length
			? finance_planfact.map((obj, i) => dateFormatter(obj.data, 'dd.MM'))
			: [];

		this.financePlanFact = finance_planfact || null;
		this.chart.data.datasets[0].data = finance_planfact.length
			? finance_planfact.map(obj => obj.revenue_accumulated)
			: [];
		this.chart.data.datasets[1].data = finance_planfact.length
			? finance_planfact.map(obj => obj.revenue_accumulated_planned)
			: [];

		const [currentD] = finance_planfact.filter(
			obj => new Date(obj.data).toDateString() == new Date().toDateString()
		);
		const data = currentD ? currentD : finance_planfact.at(-1);

		const circle = this.wpChart.querySelector('._circle.fact');
		let gradient, borderColor, color;

		if (data.revenue_accumulated > data.revenue_accumulated_planned) {
			gradient = this.createLinearGradient('rgba(206, 254, 228, 0.4)', 'rgba(206, 254, 228, 0.8)');
			borderColor = color = '#19D06D';
		} else if (data.revenue_accumulated > data.revenue_accumulated_planned) {
			gradient = this.createLinearGradient('rgba(255, 253, 205, 0.4)', 'rgba(255, 253, 205, 0.8)');
			borderColor = color = '#FFF95F';
		} else {
			gradient = this.createLinearGradient('rgba(255, 207, 207, 0.4)', 'rgba(255, 207, 207, 0.8)');
			borderColor = color = '#E03D3D';
		}

		this.chart.data.datasets[0].backgroundColor = gradient;
		this.chart.data.datasets[0].borderColor = borderColor;
		this.chart.data.datasets[0].color = color;
		circle.style.color = color;

		this.calc(dataDashboard, finance_planfact);

		this.chart.update();
	}

	async setFinancePlan(data) {
		try {
			this.loader.enable();
			const response = await api.post(`/_set_finance_plan_`, data);
			if (response.status !== 200) return;
			window.app.notify.show(response.data);
		} catch (error) {
			throw error;
		} finally {
			this.loader.disable();
		}
	}
}

export default ChartRevenue;
