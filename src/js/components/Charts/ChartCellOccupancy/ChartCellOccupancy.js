import BaseChart from "../BaseChart.js"
import merge from 'lodash.merge'
import { Select } from '../../../modules/mySelect.js';

function generateRandomData(length, min, max) {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

class ChartCellOccupancy extends BaseChart {
  constructor(ctx, addOptions = {}) {
    const defaultOptions = {
      type: 'doughnut',
      data: {
        labels: ['Свободные', 'Забронированные', 'Занятые'],
        datasets: [{
          data: [20, 60, 20], // Проценты или значения
          backgroundColor: [
            '#3b50e1',
            '#ACB3E4',
            '#8fd0ef'
          ],
          hoverOffset: 4
        }]
      },
      options: {
        cutout: '70%', // Создает отверстие в центре
        plugins: {
          legend: {
            display: false // Скрываем легенду
          },
          // title: {
          //   display: true,
          //   text: '2548 Ячеек',
          //   font: {
          //     size: 24,
          //     weight: 'bold'
          //   }
          // }
        },
        scales: {
          x: {
            display: false, // Скрываем ось X
            gridLines: {
              display: false // Скрываем сетку по оси X
            }
          },
          y: {
            display: false, // Скрываем ось Y
            gridLines: {
              display: false // Скрываем сетку по оси Y
            }
          }
        }
      }
    }

    super(ctx, merge({}, defaultOptions, addOptions));

    this.datasets = {
      1: () => {
        this.chart.data.datasets[0].hidden = true;
        this.chart.data.datasets[1].hidden = false;
        this.chart.update();
      },
      2: () => {
        this.chart.data.datasets[0].hidden = false;
        this.chart.data.datasets[1].hidden = true;
        this.chart.update();
      },
      all: () => {
        this.chart.data.datasets[0].hidden = false;
        this.chart.data.datasets[1].hidden = false;
        this.chart.update();
      },
    };

    this.selects = new Select({ uniqueName: 'select-chart-cell-occupancy', selectMinWidth: 125 });
    this.selects.onChange = this.handleSelectChange.bind(this);
  }

  handleSelectChange(e, select, value) {
    if (this.datasets[value]) {
      // this.datasets[value]();
    }
  }

  render() { }
}

export default ChartCellOccupancy