import merge from 'lodash.merge'
import BaseChart from "../BaseChart.js";
import { getMonthName } from "../../../utils/getFormattedDate.js";
import { Select } from '../../../modules/mySelect.js';

class ChartInfluxCustomers extends BaseChart {
  constructor(ctx, addOptions = {}) {

    const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(60, 80, 224, 0.1)');
    gradient.addColorStop(1, 'rgba(60, 80, 224, 0.01)');

    const defaultOptions = {
      type: 'line',
      data: {
        labels: ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сент', 'Окт', 'Нояб', 'Дек'],
        datasets: [{
          label: 'Приток клиентов (факт)',
          data: [62, 120, 180, 180, 150, 100, 180, 160, 160, 200, 300, 280],
          borderColor: '#3c50e0',
          fill: true,
          color: '#3c50e0',
          backgroundColor: gradient,
          pointRadius: 3,
          pointBackgroundColor: '#fff',
          borderWidth: 2,
        },
        {
          label: 'Приток клиентов (план)',
          data: [30, 50, 32, 66, 23, 64, 47, 87, 23, 65, 76, 64, 21, 25, 14],
          borderColor: '#6f7d90',
          color: '#6f7d90',
          pointRadius: 3,
          pointBackgroundColor: '#fff',
          borderWidth: 2,
        }]
      },
      options: {
        plugins: {
          afterDraw: (chart) => {
            if (chart.tooltip._active && chart.tooltip._active.length) {
              const activePoint = chart.tooltip._active[0];
              const ctx = chart.ctx;
              const x = activePoint.element.x;
              const topY = chart.scales.y.top;
              const bottomY = chart.scales.y.bottom;

              ctx.save();
              ctx.beginPath();
              ctx.setLineDash([5, 5]);
              ctx.moveTo(x, topY);
              ctx.lineTo(x, bottomY);
              ctx.lineWidth = 1;
              ctx.strokeStyle = '#000';
              ctx.stroke();
              ctx.restore();
            }
          }
        },
        annotation: {
          annotations: {
            line: {
              type: 'line',
              yMin: 0,
              yMax: 400,
              borderColor: 'red',
              backgroundColor: 'rgba(255, 99, 132, 0.25)',
              borderWidth: 2,
              borderDash: [10, 5],
              drawTime: 'afterDraw' // Draw the line after the chart is drawn
            }
          }
        },
      },
    };

    super(ctx, merge({}, defaultOptions, addOptions));

    this.datasets = {
      plan: () => {
        this.chart.data.datasets[0].hidden = true;
        this.chart.data.datasets[1].hidden = false;
        this.chart.update();
      },
      fact: () => {
        this.chart.data.datasets[0].hidden = false;
        this.chart.data.datasets[1].hidden = true;
        this.chart.update();
      },
      planFact: () => {
        this.chart.data.datasets[0].hidden = false;
        this.chart.data.datasets[1].hidden = false;
        this.chart.update();
      },
    };

    this.selects = new Select({ uniqueName: 'select-chart-influx-customers', selectMinWidth: 125 });
    this.selects.onChange = this.handleSelectChange.bind(this);
  }

  handleSelectChange(e, select, value) {
    if (this.datasets[value]) {
      this.datasets[value]();
    }
  }

  render(data) {
    const { sales_planfact = [] } = data;

    if (sales_planfact.length) {
      this.chart.data.labels = sales_planfact.map(obj => getMonthName(obj.data));
      this.chart.data.datasets[0].data = sales_planfact.map(obj => obj.leads_fact);
      this.chart.data.datasets[1].data = sales_planfact.map(obj => obj.sales_planned);
      this.chart.update();
    }
  }
}

export default ChartInfluxCustomers;
