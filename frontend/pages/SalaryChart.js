import { Chart as ChartJS } from "chart.js/auto";
import { Chart } from "react-chartjs-2";
import { useEffect, useRef, useState } from "react";
import "chartjs-plugin-dragdata";
import { DEFAULTS, getOrDefault } from "./Defaults";

export default function SalaryChart({ update }) {
  const chartRef = useRef(null);

  const [salaryData, setSalaryData] = useState([DEFAULTS["salary"]]);

  useEffect(() => {
    setSalaryData(getOrDefault("salary"));
  }, []);

  const POINT_PROPS = {
    pointHitRadius: 10,
    pointRadius: 5,
    pointHoverRadius: 10,
    fill: true,
    showLine: true,
  };

  function pushPoint(dataset, x) {
    let index = 0;
    for (; index < dataset.length; index++) {
      if (dataset[index].x === x) return;
      if (dataset[index].x > x) break;
    }
    let p1 = dataset[index - 1];
    let p2 = dataset[index];

    let y = ((x - p1.x) / (p2.x - p1.x)) * (p2.y - p1.y) + p1.y;

    dataset.splice(index, 0, { x: x, y: y });
  }

  let options = {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Salary",
          yAxisID: "y",
          data: salaryData,
          backgroundColor: "rgba(20, 225, 54, 0.25)",
          borderColor: "rgb(20, 225, 54)",
          order: 2,
          ...POINT_PROPS,
        },
      ],
    },
    options: {
      animation: {
        duration: 0,
      },
      scales: {
        y: {
          type: "linear",
          max: 500000,
          min: 0,
          ticks: {
            color: "white",
          },
          afterFit: function(scaleInstance) {
            scaleInstance.width = DEFAULTS["y-label-width"]; // set y-label to 40 pixel fixed
          }
        },
        x: {
          ticks: {
            color: "white",
          },
        },
      },
      onHover: function (e) {
        const point = e.chart.getElementsAtEventForMode(
          e,
          "nearest",
          { intersect: true },
          false
        );
        if (point.length) e.native.target.style.cursor = "grab";
        else e.native.target.style.cursor = "default";
      },
      onClick: function (e) {
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
          onDragStart: function (e) {
            // console.log(e)
          },
          onDrag: function (e, datasetIndex, index, value) {
            e.target.style.cursor = "grabbing";
            let datasets = chartRef.current.data.datasets;
            for (let i = 0; i < datasetIndex; i++)
              if (value.y > datasets[i].data[index].y) return false;
            for (let i = datasetIndex + 1; i < datasets.length; i++)
              if (value.y < datasets[i].data[index].y) return false;
          },
          onDragEnd: function (e, datasetIndex, index, value) {
            e.target.style.cursor = "default";
            let datasets = chartRef.current.data.datasets;
            console.log(value);
            for (let i = datasetIndex - 1; i >= 0; i--)
              if (value.y > datasets[i].data[index].y) {
                datasets[datasetIndex].data[index].y =
                  datasets[i].data[index].y;
                break;
              }
            for (let i = datasetIndex + 1; i < datasets.length; i++)
              if (value.y < datasets[i].data[index].y) {
                datasets[datasetIndex].data[index].y =
                  datasets[i].data[index].y;
                break;
              }
            console.log(datasetIndex, index, value);

            localStorage.setItem(
              "salary",
              JSON.stringify(datasets[datasetIndex].data)
            );

            // chartRef.current.options.scales = {
            //   y: {
            //     type: 'linear',
            //     max: Math.round(value * 1.2),
            //     min: 0,
            //   }
            // }

            chartRef.current.update();
            update();
          },
        },
        legend: {
          labels: {
            color: "white",
            font: {
              size: 18,
            },
          },
        },
        tooltip: {
          callbacks: {
            title: (contexts) => {
              if (!contexts) return "";
              const x = contexts[0].parsed.x;
              return "Age: " + x;
            },
            label: (context) => {
              if (context.parsed.y !== null) {
                const num = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(context.parsed.y);
                return num.toString();
              }
              return "";
            },
          },
        },
      },
    },
  };

  return (
    <div className={"flex"}>
      <div className={"flex-1"}>
        <Chart
          ref={chartRef}
          options={options.options}
          data={options.data}
          width={"100%"}
          height={"200px"}
          type={options.type}
        />
      </div>
    </div>
  );
}
