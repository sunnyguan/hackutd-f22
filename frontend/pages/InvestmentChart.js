import { Bar, Chart } from "react-chartjs-2";
import { useEffect, useRef, useState } from "react";
import "chartjs-plugin-dragdata";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import data from "../years.js";
import { DEFAULTS, POINT_PROPS } from "./Defaults";
import { aggregate_info, getChartData } from "../utils/calculations_utils";

import { Chart as Chartt } from "chart.js";

if (typeof window !== "undefined") {
  (async () => {
    const { default: zoomPlugin } = await import("chartjs-plugin-zoom");
    Chartt.register(zoomPlugin);
  })();
}

export default function InvestmentChart({ bump }) {
  const chartRef = useRef(null);
  const [netWorth, setNetWorth] = useState([]);
  const [netWorthLow, setNetWorthLow] = useState([]);
  const [netWorthHigh, setNetWorthHigh] = useState([]);
  const [maxRange, setMaxRange] = useState(200000);
  const [minRange, setMinRange] = useState(0);
  const [startYearModalOpen, setStartYearModalOpen] = useState(false);
  const [startYear, setStartYear] = useState(2000);
  const [simSelected, setSimSelected] = useState(true);
  const [sliderYear, setSliderYear] = useState(2000);

  const INVESTMENT_POINT_PROPS = {
    ...POINT_PROPS,
    pointHitRadius: 5,
    pointRadius: 0,
    pointHoverRadius: 5,
    dragData: false,
  };

  function loadNetWorth() {
    let info = {
      time_series: aggregate_info(),
      start_year: parseInt(startYear),
      num_sims: 1000,
    };

    const method = simSelected ? "monte-carlo" : "backtest";
    fetch(`http://127.0.0.1:5000/compute-${method}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(info),
    })
      .then(async (res) => {
        if (res.status === 200) return res.json();
        else if (res.status === 422) {
          const data = await res.json();
          console.log(data);
          alert("Backend failure: " + data.text);
        }
      })
      .then((data) => {
        const [netWorth, netWorthLow, netWorthHigh, mx, mn] = getChartData(
          data,
          method
        );
        setNetWorth(netWorth);
        setNetWorthLow(netWorthLow);
        setNetWorthHigh(netWorthHigh);
        setMaxRange(mx);
        setMinRange(mn);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(loadNetWorth, [bump, startYear, simSelected]);

  let options = {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Net Worth Mid",
          yAxisID: "y1",
          data: netWorth,
          backgroundColor: "rgba(10, 173, 255, 0.25)",
          borderColor: "rgb(10, 173, 255)",
          order: 2,
          ...INVESTMENT_POINT_PROPS,
        },
        {
          label: "Net Worth Low",
          yAxisID: "y2",
          data: netWorthLow,
          backgroundColor: "rgba(0, 68, 102, 0.25)",
          borderColor: "rgb(0, 68, 102)",
          order: 1,
          ...INVESTMENT_POINT_PROPS,
        },
        {
          label: "Net Worth High",
          yAxisID: "y3",
          data: netWorthHigh,
          backgroundColor: "rgba(173, 228, 255, 0.25)",
          borderColor: "rgb(173, 228, 255)",
          order: 3,
          ...INVESTMENT_POINT_PROPS,
        },
      ],
    },
    options: {
      scales: {
        y1: {
          type: "linear",
          max: maxRange,
          min: minRange,
          ticks: {
            color: "white",
          },
          afterFit: function (scaleInstance) {
            scaleInstance.width = DEFAULTS["y-label-width"]; // set y-label to 40 pixel fixed
          },
        },
        y2: {
          type: "linear",
          max: maxRange,
          min: minRange,
          display: false,
          ticks: {
            color: "white",
          },
        },
        y3: {
          type: "linear",
          max: maxRange,
          min: minRange,
          display: false,
          ticks: {
            color: "white",
          },
        },
        x: {
          ticks: {
            color: "white",
          },
        },
      },
      plugins: {
        zoom: {
          pan: {
            enabled: true,
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "xy",
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
      responsive: true,
      maintainAspectRatio: false,
    },
  };

  const options2 = {
    pan: {
      enabled: true,
      mode: "xy",
    },
    zoom: {
      enabled: true,
      drag: false,
      mode: "xy",
    },
    scales: {
      x: {
        display: false,
        min: 1929,
        max: 2022,
        type: "linear",
        offset: false,
        gridLines: {
          offsetGridLines: false,
        },
        title: {
          display: true,
          text: "Arrivals per minute",
        },
        ticks: {
          color: "white",
        },
      },
      y: {
        ticks: {
          color: "white",
        },
      },
    },

    plugins: {
      beforeInit: function (chart, args, options) {
        console.log("called");
      },
      afterDatasetDraw: () => {
        console.log("called");
      },
      legend: {
        labels: {
          color: "white",
          font: {
            size: 18,
          },
        },
      },
    },
  };

  return (
    <>
      <div
        id="popup-modal"
        tabIndex="-1"
        style={{ display: startYearModalOpen ? "block" : "none" }}
        className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full"
      >
        <div
          className="relative p-4 w-full max-w-2xl h-full md:h-auto m-auto"
          style={{
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button
              type="button"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
              data-modal-toggle="popup-modal"
              onClick={() => {
                setStartYearModalOpen(false);
              }}
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
            <div className="p-6 text-center text-black">
              <Bar
                data={{
                  datasets: [
                    {
                      label: "Unemployment",
                      borderColor: "black",
                      lineTension: 0,
                      fill: true,
                      borderJoinStyle: "round",
                      data: data.unemployment,
                      borderWidth: 0.2,
                      barPercentage: 1,
                      categoryPercentage: 1,
                      backgroundColor: "lightgray",
                      barThickness: "flex",
                    },
                  ],
                }}
                options={options2}
                plugins={[
                  {
                    afterDatasetDraw: () => {
                      console.log("called");
                    },
                  },
                ]}
              />
              <Slider
                defaultValue={2000}
                className={"mt-4"}
                min={1929}
                max={2022}
                trackStyle={{ backgroundColor: "white" }}
                railStyle={{ backgroundColor: "lightblue" }}
                onAfterChange={(e) => {
                  setStartYear(e);
                }}
                onChange={(e) => {
                  setSliderYear(e);
                }}
              />
              <div className={"text-white"}>{sliderYear}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flow-root px-4 text-2xl">
        <div className="float-left space-x-4">
          <a>Start Year:</a>
          <button
            className={
              "bg-transparent transition-colors hover:bg-blue-500 hover:bg-opacity-50 text-white py-1 px-4 border border-blue-700 rounded"
            }
            onClick={() => setStartYearModalOpen(true)}
          >
            {startYear}
          </button>
        </div>
        <div className="float-right">
          <div className="inline-flex space-x-1 bg-black rounded">
            <button
              className={
                (simSelected ? "bg-blue-400" : "bg-gray-300") +
                " transition-colors hover:bg-gray-400 text-gray-800 font-bold py-1 px-4 rounded-l-md"
              }
              onClick={() => setSimSelected(true)}
            >
              Simulate
            </button>
            <button
              className={
                (simSelected ? "bg-gray-300" : "bg-blue-400") +
                " transition-colors hover:bg-gray-400 text-gray-800 font-bold py-1 px-4 rounded-r-md"
              }
              onClick={() => setSimSelected(false)}
            >
              Backtest
            </button>
          </div>
        </div>
      </div>

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
      <button
        onClick={() => {
          chartRef.current.resetZoom();
        }}
        className={
          "self-center m-2 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900"
        }
      >
        Reset Zoom
      </button>
    </>
  );
}
