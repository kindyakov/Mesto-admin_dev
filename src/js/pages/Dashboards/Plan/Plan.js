import Dashboards from '../Dashboards.js';
import TablePlan from '../../../components/Tables/TablePlan/TablePlan.js';
import ScaleUtils from './ScaleUtils.js';
import HideShow from './HideShow.js';
import EditPlanUtils from './EditPlanUtils.js';
import { getFinancePlan } from '../../../settings/request.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';

class Plan extends Dashboards {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-plan',
          TableComponent: TablePlan,
          params: {
            getData: (queryParams) => getFinancePlan({ warehouse_id: this.app.warehouse.warehouse_id, ...queryParams })
          },
        },
      ],

      page: 'dashboards/plan'
    });

    HideShow.initButtonsHideShow(this.wrapper);
    this.editPlanUtils = null;
  }

  async getData(queryParams = {}) {
    return getFinancePlan({ warehouse_id: this.app.warehouse.warehouse_id, ...this.queryParams });
  }

  onRender(_, { finance_planfact }) {
    const result = finance_planfact
      .map(({
        revenue_planned,
        revenue,
        inflow_area_planned,
        inflow_area,
        leads_planned,
        leads_fact
      }) => {
        return {
          revenue_planned,
          revenue,
          inflow_area_planned,
          inflow_area,
          leads_planned,
          leads_fact
        }
      })
      .reduce((acc, obj) => {
        for (let key in obj) {
          acc[key] = (acc[key] || 0) + obj[key];
        }
        return acc;
      }, {});

    result['revenue_percent'] = result.revenue && result.revenue_planned ? result.revenue / result.revenue_planned : 0;
    result['inflow_area_percent'] = result.inflow_area && result.inflow_area_planned ? result.inflow_area / result.inflow_area_planned : 0;
    result['leads_percent'] = result.leads_fact && result.leads_planned ? result.leads_fact / result.leads_planned : 0;

    const winds = this.wrapper.querySelectorAll('[data-finance]')
    winds.length && winds.forEach(item => {
      const key = item.dataset.finance

      if (key) {
        let text = 0
        if (key === 'revenue_planned' || key === 'revenue') {
          text = formattingPrice(result[key])
        } else if (result[key]) [
          text = result[key].toFixed(0)
        ]

        item.textContent = text
      }
    })

    const rates = this.wrapper.querySelectorAll('[data-finance-rate]')
    rates.length && rates.forEach(item => {
      const key = item.dataset.financeRate
      if (key) {
        item.textContent = result[key] && result[key] !== Infinity ? (result[key] * 100).toFixed(0) + '%' : '0%'
      }
    })

    const ratesInfo = this.wrapper.querySelectorAll('[data-finance-rate-width]')
    ratesInfo.length && ratesInfo.forEach(item => {
      const key = item.dataset.financeRateWidth
      if (key) {
        item.style.cssText = `background: ${result[key] >= 1 && result[key] !== Infinity ? '#5fc057' : '#c05757'};
        width: ${result[key] >= 1 ? '100%' : (result[key] * 100).toFixed(0) + '%'}`
      }
    })

    const ratesImg = this.wrapper.querySelectorAll('[data-finance-rate-img]')
    ratesImg.length && ratesImg.forEach(item => {
      const key = item.dataset.financeRateImg
      if (key) {
        item.src = `./img/svg/${result[key] >= 1 ? 'ion_checkmark-done-circle.svg' : 'carbon_close-filled.svg'}`
      }
    })

    this.updateProgressBars(result);
    this.initEditPlanUtils();
  }

  updateProgressBars(result) {
    // Маппинг ключей для разных типов полосок
    const barMappings = {
      'revenue': {
        fact: 'revenue',
        planned: 'revenue_planned'
      },
      'inflow_area': {
        fact: 'inflow_area',
        planned: 'inflow_area_planned'
      },
      'leads': {
        fact: 'leads_fact',
        planned: 'leads_planned'
      }
    };

    // Маппинг для шкал (соответствие data-scale атрибутам в HTML)
    const scaleMappings = {
      'revenue': {
        planned: 'revenue_planned'
      },
      'inflow': {
        planned: 'inflow_area_planned'
      },
      'leads': {
        planned: 'leads_planned'
      }
    };

    // Обработка каждого типа полоски
    Object.keys(barMappings).forEach(barType => {
      const mapping = barMappings[barType];
      const factValue = result[mapping.fact] || 0;
      const plannedValue = result[mapping.planned] || 0;

      if (plannedValue === 0) return; // Избегаем деления на ноль

      // Вычисляем проценты относительно плана (план = 100%)
      const factPercent = Math.min((factValue / plannedValue) * 100, 100);

      // Находим элементы полоски для данного типа
      const factBar = this.wrapper.querySelector(`[data-bar="${barType}"]`);
      const plannedBar = this.wrapper.querySelector(`[data-bar="${barType}_planned"]`);

      if (factBar && plannedBar) {
        // Если факт больше плана, то полоска факта занимает всё место
        if (factValue >= plannedValue) {
          factBar.style.width = '100%';
          plannedBar.style.width = '0%';
        } else {
          factBar.style.width = `${factPercent}%`;
          plannedBar.style.width = `${100 - factPercent}%`;
        }

        // Обновляем текст внутри полосок
        const factText = factBar.querySelector('span');
        const plannedText = plannedBar.querySelector('span');

        if (factText) {
          factText.textContent = barType === 'revenue' ? formattingPrice(factValue) : factValue;
        }

        if (plannedText) {
          plannedText.textContent = barType === 'revenue' ? formattingPrice(plannedValue) : plannedValue.toFixed(0);
        }
      }
    });

    // Обновляем все шкалы используя утилиту
    ScaleUtils.updateAllScales(this.wrapper, result, scaleMappings);
  }

  initEditPlanUtils() {
    if (this.editPlanUtils) {
      this.editPlanUtils = null;
    }

    this.editPlanUtils = new EditPlanUtils(this.wrapper, this.queryParams.end_date);
  }
}

export default Plan;