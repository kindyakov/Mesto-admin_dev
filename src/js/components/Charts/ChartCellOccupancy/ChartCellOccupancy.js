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
        labels: ['Свободные', 'Забронированные', 'Занятые', 'Прочее'],
        datasets: [{
          data: [20, 40, 20, 20], // Проценты или значения
          backgroundColor: [
            '#3b50e1',
            '#ACB3E4',
            '#8fd0ef',
            "#ABCCCF"
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

    const func = (floor) => {
      const filterRooms = this.rooms.filter(room => room.floor == floor)
      this.countCellsEl.textContent = filterRooms.length

      this.chart.data.datasets[0].data = [
        this.dataFilter(this.rooms, 0, floor),
        this.dataFilter(this.rooms, 0.5, floor),
        this.dataFilter(this.rooms, 1, floor),
      ]

      this.chart.update();
    }

    this.datasets = {
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

    this.selectSort = this.wpChart.querySelector('select[name="sort"]')
    this.selectSort.style.display = 'none'

    if (this.app.warehouse.num_of_floors > 1) {
      this.selectSort.innerHTML = new Array(this.app.warehouse.num_of_floors).fill(0).map((c, i) => {
        this.datasets[i + 1] = func
        return `<option value="${i + 1}">${i + 1} этаж</option>`
      })
      this.selectSort.insertAdjacentHTML('afterbegin', `<option value="all">Все этажи</option>`)
      this.selects = new Select({ uniqueName: 'select-chart-cell-occupancy', selectMinWidth: 125 });
      this.selects.onChange = this.handleSelectChange.bind(this);
    }
  }

  handleSelectChange(e, select, value) {
    if (this.datasets[value]) {
      this.datasets[value]?.(value)
    }
  }

  dataFilter(rooms, rented, floor = false) {
    let data = []
    if (floor) {
      data = rooms.filter(room => room.rented == rented && room.floor == floor)
    } else {
      data = rooms.filter(room => room.rented == rented)
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
    const other = rented_cnt.filter(obj => +obj.rented !== 1 && +obj.rented !== 0.5 && +obj.rented !== 1 && +obj.rented !== -1)

    const result = other.reduce((acc, obj) => {
      for (let key in obj) {
        if (key !== 'rented') {
          acc[key] = (acc[key] || 0) + obj[key];
        }
      }
      return acc;
    }, {});

    console.log(result);

    this.chart.data.datasets[0].data = [
      free ? free.cnt : 0,
      booked ? booked.cnt : 0,
      busy ? busy.cnt : 0,
      other ? result.cnt : 0
    ]

    this.countCellsEl.textContent = plan_rooms.length
    this.widgets.length && this.widgets.forEach(widget => {
      const rented = widget.getAttribute('data-chart-widget')
      if (rented === 'other') {
        widget.innerText = result.rate.toFixed(1) + "%"
      } else {
        const [currentData = null] = rented_cnt.filter(obj => +obj.rented === +rented)
        widget.innerText = currentData ? `${currentData.rate.toFixed(2)}%` : '0%'
      }
    })

    this.chart.update()
  }
}

export default ChartCellOccupancy