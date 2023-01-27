import { Bar, Chart } from "react-chartjs-2";
import { useEffect, useRef, useState } from "react";
import "chartjs-plugin-dragdata";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import * as yearVis from "../years.json";
import { DEFAULTS, getOrDefault, POINT_PROPS } from "./Defaults";

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

  // for (let i = 0; i < 101; i++) {
  //   TEST["time_series"]["cash"].push(0.8);
  //   TEST["time_series"]["stocks"].push(0.1);
  //   TEST["time_series"]["bonds"].push(0.1);
  //   TEST["time_series"]["savings"].push(5000);
  // }

  function calculate(values, div) {
    let res = [];
    for (let i = 0; i < values.length - 1; i++) {
      for (let j = values[i].x; j < values[i + 1].x; j++) {
        let newy =
          ((values[i + 1].y - values[i].y) / (values[i + 1].x - values[i].x)) *
            (j - values[i].x) +
          values[i].y;
        res.push(newy / div);
      }
    }
    res.push(values[values.length - 1].y / div);
    return res;
  }

  function diff(values1, values2) {
    let res1 = calculate(values1, 1);
    let res2 = calculate(values2, 1);
    let res = [];
    for (let i = 0; i < res1.length; i++) {
      res.push(res1[i] - res2[i]);
    }
    console.log(res);
    return res;
  }

  function loadNetWorth() {
    const [cash, bonds, stocks] = getOrDefault("investments");
    const savings = getOrDefault("salary")[0];
    const budget = getOrDefault("budgets")[0];
    const loans = getOrDefault("budgets")[3];

    let info = {
      time_series: {
        cash: calculate(cash, 100),
        stocks: calculate(stocks, 100),
        bonds: calculate(bonds, 100),
        savings: diff(savings, budget),
        loans: calculate(loans, 1),
      },
      start_year: parseInt(startYear),
      num_sims: 1000,
    };

    console.log(info);

    const length = info["time_series"]["cash"].length;

    for (let i = 0; i < length; i++) {
      info["time_series"]["cash"][i] -= info["time_series"]["stocks"][i];
      info["time_series"]["stocks"][i] -= info["time_series"]["bonds"][i];
    }

    for (let i = 0; i < length; i++) {
      console.log(
        info["time_series"]["cash"][i] +
          info["time_series"]["bonds"][i] +
          info["time_series"]["stocks"][i]
      );
    }

    console.log(info);
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
        let mx = 0;
        let mn = 0;
        if (method === "monte-carlo") {
          let temp = [];
          for (let i = 20; i <= 100; i++)
            temp.push({ x: i, y: data.time_series.mid[i - 20] });
          setNetWorth(temp);

          temp = [];
          for (let i = 20; i <= 100; i++)
            temp.push({ x: i, y: data.time_series.low[i - 20] });
          setNetWorthLow(temp);

          temp = [];
          for (let i = 20; i <= 100; i++) {
            temp.push({ x: i, y: data.time_series.high[i - 20] });
            mx = Math.max(mx, data.time_series.high[i - 20]);
            mn = Math.min(mn, data.time_series.high[i - 20]);
          }
          setNetWorthHigh(temp);
          setMaxRange(mx * 1.1);
          setMinRange(mn - 1000);
        } else {
          let temp = [];
          for (let i = 20; i < 20 + data.time_series.net_worth.length; i++) {
            let val = data.time_series.net_worth[i - 20];
            if (!isNaN(val)) {
              mx = Math.max(mx, val);
              mn = Math.min(mn, val);
              temp.push({ x: i, y: val });
            }
          }
          setNetWorth(temp);
          setNetWorthLow([]);
          setNetWorthHigh([]);
          setMaxRange(mx * 1.1);
          setMinRange(mn - 1000);
        }
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

  function update() {
    loadNetWorth();
  }

  function handleChange(e) {
    e.preventDefault();
    setStartYear(e.target.value);
  }

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
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
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
                      data: yearVis.unemployment,
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
    </>
  );
}
