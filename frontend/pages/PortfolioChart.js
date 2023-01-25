import { Chart as ChartJS } from "chart.js/auto";
import { Chart } from "react-chartjs-2";
import { useEffect, useRef, useState } from "react";
import "chartjs-plugin-dragdata";
import {DEFAULTS, getOrDefault} from "./Defaults";

export default function PortfolioChart({ update }) {
  const chartRef = useRef(null);
  const [investment1, setInvestment1] = useState([]);
  const [investment2, setInvestment2] = useState([]);
  const [investment3, setInvestment3] = useState([]);

  function save(datasets) {
    localStorage.setItem("investments-0", JSON.stringify(datasets[0].data));
    localStorage.setItem("investments-1", JSON.stringify(datasets[1].data));
    localStorage.setItem("investments-2", JSON.stringify(datasets[2].data));
  }

  useEffect(() => {
    setInvestment1(getOrDefault("investments-0"));
    setInvestment2(getOrDefault("investments-1"));
    setInvestment3(getOrDefault("investments-2"));
    // save(chartRef.current.data.datasets);
    chartRef.current.update();
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
          label: "Cash",
          yAxisID: "y",
          data: investment1,
          backgroundColor: "rgba(255, 219, 153, 0.25)",
          borderColor: "rgb(255, 219, 153)",
          order: 2,
          dragData: false,
          ...POINT_PROPS,
          pointRadius: 0,
        },
        {
          label: "Bonds",
          yAxisID: "y2",
          data: investment2,
          backgroundColor: "rgba(255, 176, 31, 0.25)",
          borderColor: "rgb(255, 176, 31)",
          order: 1,
          tension: 0.2,
          ...POINT_PROPS,
        },
        {
          label: "Stocks",
          yAxisID: "y3",
          tension: 0.2,
          data: investment3,
          backgroundColor: "rgba(102, 66, 0, 0.25)",
          borderColor: "rgb(102, 66, 0)",
          order: 0,
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
          max: 100,
          min: 0,
          display: false,
          ticks: {
            color: "white",
          },
        },
        y2: {
          type: "linear",
          max: 100,
          min: 0,
          display: false,
          ticks: {
            color: "white",
          },
        },
        y3: {
          type: "linear",
          max: 100,
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
        for (let dataset of datasets) {
          pushPoint(dataset.data, Math.round(x));
        }
        save(datasets);

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
            console.log(datasets);
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

            save(datasets);
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
          mode: "x",
          itemSort: (a, b) => {
            return a.datasetIndex - b.datasetIndex;
          },
          callbacks: {
            title: (contexts) => {
              if (!contexts) return "";
              const x = contexts[0].parsed.x;
              return "Age: " + x;
            },
            label: (context) => {
              let label = context.dataset.label || "";

              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                // Determine what the point directly underneath this is, if any
                const datasets = chartRef.current.data.datasets;
                const indexBelow = context.datasetIndex + 1;
                const yDiff =
                  context.parsed.y -
                  (indexBelow < datasets.length
                    ? datasets[indexBelow].data[context.dataIndex].y
                    : 0);
                label += Math.round((yDiff + Number.EPSILON) * 100) / 100;
                label += "%";
              }
              return label;
            },
          },
        },
      },
    },
    plugins: [
      {
        afterDraw: (chart) => {
          if (chart.tooltip?._active?.length) {
            let x = chart.tooltip._active[0].element.x;
            let yAxis = chart.scales.y;
            let ctx = chart.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, yAxis.top);
            ctx.lineTo(x, yAxis.bottom);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#ff0000";
            ctx.stroke();
            ctx.restore();
          }
        },
      },
    ],
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
          className={"h-full"}
          plugins={options.plugins}
        />
      </div>
    </div>
  );
}
