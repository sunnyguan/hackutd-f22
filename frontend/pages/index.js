import { Chart as ChartJS } from 'chart.js/auto'
import { Chart }            from 'react-chartjs-2'
import { useRef } from "react";
import 'chartjs-plugin-dragdata'

const NUM_POINTS = 80;
const RAND_MAX = 40;

export default function Home() {

  const chartRef = useRef(null);

  function genRandom(count, range_min, range_max) {
    let temp = [];
    for (let i = 0; i < count; i++)
      temp.push(Math.random() * (range_max - range_min) + range_min);
    return temp;
  }

  let data = [
      genRandom(10, 0, 10),
      genRandom(10, 10, 20),
      genRandom(10, 20,30),
  ];

  var options = {
    type: 'line',
    data: {
      labels: ['1', '2', '3', '4', '5'],
      datasets: [{
        label: 'A',
        yAxisID: 'y',
        data: data[0],
        pointHitRadius: 50,
        backgroundColor: "salmon",
        borderColor: "red",
        fill: true,
        order: 0,
      }, {
        label: 'B',
        yAxisID: 'y2',
        data: data[1],
        pointHitRadius: 25,
        backgroundColor: "lightgreen",
        borderColor: "green",
        fill: true,
        order: 1,
      }, {
        label: 'C',
        yAxisID: 'y3',
        data: data[2],
        pointHitRadius: 25,
        backgroundColor: "lightblue",
        borderColor: "blue",
        fill: true,
        order: 2,
      }]
    },
    options: {
      scales: {
        y: {
          type: 'linear',
          max: RAND_MAX,
          min: 0,
          display: false
        },
        y2: {
          type: 'linear',
          max: RAND_MAX,
          min: 0,
          display: false
        },
        y3: {
          type: 'linear',
          max: RAND_MAX,
          min: 0,
        }
      },
      onHover: function(e) {
        const point = e.chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false)
        if (point.length) e.native.target.style.cursor = 'grab'
        else e.native.target.style.cursor = 'default'
      },
      responsive: true,
      plugins: {
        dragData: {
          round: 2,
          showTooltip: true,
          onDragStart: function(e) {
            // console.log(e)
          },
          onDrag: function(e, datasetIndex, index, value) {
            e.target.style.cursor = 'grabbing'

            let datasets = chartRef.current.data.datasets;
            for (let i = 0; i < datasetIndex; i++)
              if (value > datasets[i].data[index])
                return false;
            for (let i = datasetIndex + 1; i < datasets.length; i++)
              if (value < datasets[i].data[index])
                return false;
            // console.log(e, datasetIndex, index, value)
          },
          onDragEnd: function(e, datasetIndex, index, value) {
            e.target.style.cursor = 'default'
            // console.log(datasetIndex, index, value)
          },
        }
      }
    }
  }

  return (
      <Chart
          ref={chartRef}
          options={options.options}
          data={options.data}
          width={"100%"}
          height={"100%"}
          type={options.type}
      />
  )

}