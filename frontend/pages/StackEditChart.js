import "chart.js/auto";
import { Chart } from "react-chartjs-2";
import { useEffect, useRef, useState } from "react";
import "chartjs-plugin-dragdata";
import { DEFAULTS, getOrDefault, POINT_PROPS, SCALE_PROPS } from "./Defaults";

export default function StackEditChart({
  update,
  name,
  line_options,
  add_point_props,
  add_scale_props,
  height,
}) {
  const num_categories = line_options.length;
  const chartRef = useRef(null);
  const [investments, setInvestments] = useState(
    new Array(num_categories).fill([])
  );

  function save(datasets, refresh = true) {
    let combined = [];
    for (let dataset of datasets) combined.push(dataset.data);
    localStorage.setItem(name, JSON.stringify(combined));
    if (refresh) {
      chartRef.current.update();
      update();
    }
  }

  function popPoint(dataset, x) {
    // Find closest point other than endpoints
    let closest = NaN;
    for (let index = 1; index < dataset.length - 1; index++) {
      if (
        isNaN(closest) ||
        Math.abs(x - dataset[index].x) < Math.abs(x - dataset[closest].x)
      ) {
        closest = index;
      }
    }
    // If no eligible closest point, do nothing
    if (isNaN(closest) || Math.abs(x - dataset[closest].x) > 5) return;
    // Take out this point
    dataset.splice(closest, 1);
  }

  function handleRightMouse(e) {
    // Block default context menu & other stuff resulting from right click
    e.preventDefault();
    e.stopPropagation();

    // Get click coordinates
    let chart = chartRef.current;
    let x = chart.scales.x.getValueForPixel(e.offsetX); // For some reason x is not the same as onClick's x, but offsetX matches.
    let y = chart.scales.y0.getValueForPixel(e.offsetY);

    // Potentially remove point from chart
    let datasets = chart.data.datasets;
    for (let dataset of datasets) {
      popPoint(dataset.data, Math.round(x));
    }
    save(datasets);
  }

  function deleteHandler(chart) {
    chart.canvas.addEventListener("contextmenu", handleRightMouse, false);
  }

  function afterDrawHandler(chart) {
    if (chart.tooltip?._active?.length) {
      let x = chart.tooltip._active[0].element.x;
      let yAxis = chart.scales.y0;
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
  }

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

  useEffect(() => {
    setInvestments(getOrDefault(name));
    if (chartRef.current !== null) chartRef.current.update();
  }, []);

  let datasets = [];
  let scales = {};
  for (let i = 0; i < num_categories; i++) {
    datasets.push({
      ...POINT_PROPS,
      ...add_point_props,
      ...line_options[i],
      data: investments[i],
      yAxisID: `y${i}`,
      order: num_categories - i,
    });
    scales[`y${i}`] = {
      ...SCALE_PROPS,
      ...add_scale_props,
    };
    if (i === 0) {
      scales[`y${i}`] = {
        ...scales[`y${i}`],
        display: true,
        afterFit: function (scaleInstance) {
          scaleInstance.width = DEFAULTS["y-label-width"];
        },
      };
    }
  }

  let options = {
    type: "scatter",
    data: {
      datasets: datasets,
    },
    options: {
      animation: {
        duration: 0,
      },
      scales: scales,
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
        let y = chart.scales.y0.getValueForPixel(e.y);
        let datasets = chart.data.datasets;
        for (let dataset of datasets) pushPoint(dataset.data, Math.round(x));
        save(datasets);
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        dragData: {
          round: 2,
          showTooltip: true,
          magnet: false,
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
            save(datasets);
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
                label += new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(context.parsed.y);
              }
              return label;
            },
          },
        },
      },
    },
    plugins: [
      {
        afterDraw: afterDrawHandler,
        afterInit: deleteHandler,
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
          height={height}
          type={options.type}
          className={"h-full"}
          plugins={options.plugins}
        />
      </div>
    </div>
  );
}
