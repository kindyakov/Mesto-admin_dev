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
            display: false,
          },
          tooltip: {
            enabled: true,
          }
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

    this.rooms = []

    this.wp = this.chart.canvas.closest('.chart')
    this.countCellsEl = this.wp.querySelector('.count-cells b')
    this.widgets = this.wp.querySelectorAll('[data-chart-widget]')

    this.datasets = {
      1: () => {
        const filterRooms = this.rooms.filter(room => room.floor === 1)
        this.countCellsEl.textContent = filterRooms.length

        this.chart.data.datasets[0].data = [
          this.dataFilter(this.rooms, 0, 1),
          this.dataFilter(this.rooms, 0.5, 1),
          this.dataFilter(this.rooms, 1, 1),
        ]
        this.chart.update();
      },
      2: () => {
        const filterRooms = this.rooms.filter(room => room.floor === 2)
        this.countCellsEl.textContent = filterRooms.length

        this.chart.data.datasets[0].data = [
          this.dataFilter(this.rooms, 0, 2),
          this.dataFilter(this.rooms, 0.5, 2),
          this.dataFilter(this.rooms, 1, 2),
        ]
        this.chart.update();

      },
      all: () => {
        this.countCellsEl.textContent = this.rooms.length
        this.chart.data.datasets[0].data = [
          this.dataFilter(this.rooms, 0),
          this.dataFilter(this.rooms, 0.5),
          this.dataFilter(this.rooms, 1),
        ]
        this.chart.update();
      },
    };

    this.selects = new Select({ uniqueName: 'select-chart-cell-occupancy', selectMinWidth: 125 });
    this.selects.onChange = this.handleSelectChange.bind(this);
  }

  handleSelectChange(e, select, value) {
    if (this.datasets[value]) {
      this.datasets[value]();
    }
  }

  dataFilter(rooms, rented, floor = false) {
    let data = []
    if (floor) {
      data = rooms.filter(room => +room.rented === rented && +room.floor === floor)
    } else {
      data = rooms.filter(room => +room.rented === rented)
    }
    return data.length
  }

  render(data) {
    const { rented_cnt = [], plan_rooms = [] } = data

    this.rooms = plan_rooms

    if (!rented_cnt.length) return
    const [free = null] = rented_cnt.filter(obj => +obj.rented === 0)
    const [booked = null] = rented_cnt.filter(obj => +obj.rented === 0.5)
    const [busy = null] = rented_cnt.filter(obj => +obj.rented === 1)

    this.chart.data.datasets[0].data = [
      free ? free.cnt : 0,
      booked ? booked.cnt : 0,
      busy ? busy.cnt : 0
    ]

    this.countCellsEl.textContent = plan_rooms.length
    this.widgets.length && this.widgets.forEach(widget => {
      const rented = +widget.getAttribute('data-chart-widget')
      const [currentData = null] = rented_cnt.filter(obj => +obj.rented === rented)
      widget.innerText = currentData ? `${currentData.rate}%` : '0%'
    })

    this.chart.update()
  }
}

export default ChartCellOccupancy