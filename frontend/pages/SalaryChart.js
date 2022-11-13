import { Chart as ChartJS } from 'chart.js/auto'
import { Chart }            from 'react-chartjs-2'
import {useEffect, useRef, useState} from "react";
import 'chartjs-plugin-dragdata'

export default function SalaryChart() {

  const chartRef = useRef(null);

  const POINT_PROPS = {
    pointHitRadius: 25,
    pointRadius: 5,
    pointHoverRadius: 10,
    fill: true,
    showLine: true
  }

  function pushPoint(dataset, x) {
    let index = 0;
    for (; index < dataset.length; index++) {
      if (dataset[index].x === x) return;
      if (dataset[index].x > x)
        break;
    }
    let p1 = dataset[index - 1];
    let p2 = dataset[index];

    let y = (x - p1.x) / (p2.x - p1.x) * (p2.y - p1.y) + p1.y;

    dataset.splice(index, 0, {x: x, y: y});
  }

  let options = {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Salary',
        yAxisID: 'y',
        data: JSON.parse(localStorage.getItem('salary')) || [
            {
              x: 20, y: 50000
            },
            {
              x: 100, y: 500000
            }
        ],
        backgroundColor: "lightgreen",
        borderColor: "green",
        order: 2,
        ...POINT_PROPS,
      }]
    },
    options: {
      animation: {
        duration: 0
      },
      scales: {
        y: {
          type: 'linear',
          max: 1000000,
          min: 0,
        }
      },
      onHover: function(e) {
        const point = e.chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false)
        if (point.length) e.native.target.style.cursor = 'grab'
        else e.native.target.style.cursor = 'default'
      },
      onClick: function(e) {
        let chart = chartRef.current;
        let x = chart.scales.x.getValueForPixel(e.x);
        let y = chart.scales.y.getValueForPixel(e.y);
        console.log(x, y);

        let datasets = chart.data.datasets;
        pushPoint(datasets[0].data, Math.round(x));

        chart.update();
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        dragData: {
          round: 2,
          showTooltip: true,
          magnet: false,
          onDragStart: function(e) {
            // console.log(e)
          },
          onDrag: function(e, datasetIndex, index, value) {
            e.target.style.cursor = 'grabbing'
            let datasets = chartRef.current.data.datasets;
            for (let i = 0; i < datasetIndex; i++)
              if (value.y > datasets[i].data[index].y)
                return false;
            for (let i = datasetIndex + 1; i < datasets.length; i++)
              if (value.y < datasets[i].data[index].y)
                return false;
          },
          onDragEnd: function(e, datasetIndex, index, value) {
            e.target.style.cursor = 'default'
            let datasets = chartRef.current.data.datasets;
            console.log(value)
            for (let i = datasetIndex - 1; i >= 0; i--)
              if (value.y > datasets[i].data[index].y) {
                datasets[datasetIndex].data[index].y = datasets[i].data[index].y;
                break;
              }
            for (let i = datasetIndex + 1; i < datasets.length; i++)
              if (value.y < datasets[i].data[index].y) {
                datasets[datasetIndex].data[index].y = datasets[i].data[index].y;
                break;
              }
            console.log(datasetIndex, index, value)

            localStorage.setItem('salary', JSON.stringify(datasets[datasetIndex].data));

            chartRef.current.options.scales = {
              y: {
                type: 'linear',
                max: Math.round(value * 1.2),
                min: 0,
              }
            }

            chartRef.current.update();
          },
        }
      }
    }
  }

  return (
      <div className={"flex"}>
        <div className={"flex-1"}>
          <Chart
              ref={chartRef}
              options={options.options}
              data={options.data}
              width={"100%"}
              height={"400px"}
              type={options.type}
          />
        </div>
      </div>
  )

}