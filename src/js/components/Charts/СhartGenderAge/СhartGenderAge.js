import BaseChart from "../BaseChart.js"

class ChartGenderAge extends BaseChart {
  constructor(ctx, addOptions = {}) {
    super(ctx, {
      type: 'bar',
      data: {
        labels: ['до 18', '18-25', '25-30', '30-35', '35-45', 'от 45'],
        datasets: [{
          label: 'Мужчины',
          data: [25, 20, 35, 15, 20, 25],
          backgroundColor: '#3c50e0',
          color: '#3c50e0',
          barThickness: 12
        }, {
          label: 'Женщины',
          data: [20, 28, 15, 12, 18, 30],
          backgroundColor: '#80caed',
          color: '#80caed',
          barThickness: 12
        }]
      },
      options: {
        responsive: true,
        layout: {
          height: 400,
        },
        scales: {
          x: {
            // stacked: true,
            barPercentage: 0.1, // Устанавливаем ширину столбца в 50% от ширины группы
            grid: {
              display: false  // Убирает вертикальную сетку
            },
          },
          y: {
            // beginAtZero: true,
            // yAxes: [{
            //   ticks: {
            //     beginAtZero: true
            //   }
            // }],
            grid: {
              borderDash: [5, 5],  // Делает горизонтальную сетку пунктирной
              color: '#e2e8f0'  // Цвет пунктирной сетки (опционально)
            },
            ticks: {
              callback: function (value, index, values) {
                return value + '%';
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top'
          }
        },
      }
    })

  }

  render(data) {
    const { sex_age_data = [] } = data

    if (sex_age_data.length) {

    }
  }
}

export default ChartGenderAge