import { Chart as ChartJS } from 'chart.js/auto'
import { Chart }            from 'react-chartjs-2'
import {useEffect, useRef, useState} from "react";
import 'chartjs-plugin-dragdata'

export default function InvestmentChart({bump}) {

  const chartRef = useRef(null);
  const [netWorth, setNetWorth] = useState([]);
  const [netWorthLow, setNetWorthLow] = useState([]);
  const [netWorthHigh, setNetWorthHigh] = useState([]);
  const [maxRange, setMaxRange] = useState(200000);
  const [startYearModalOpen, setStartYearModalOpen] = useState(false);
  const [startYear, setStartYear] = useState(1960);
  const [simSelected, setSimSelected] = useState(true);

  // for (let i = 0; i < 101; i++) {
  //   TEST["time_series"]["cash"].push(0.8);
  //   TEST["time_series"]["stocks"].push(0.1);
  //   TEST["time_series"]["bonds"].push(0.1);
  //   TEST["time_series"]["savings"].push(5000);
  // }

  function calculate(values) {
    let res = [];
    for (let i = 0; i < values.length - 1; i++) {
      for (let j = values[i].x; j < values[i + 1].x; j++) {
        let newy = (values[i + 1].y - values[i].y) / (values[i + 1].x - values[i].x) * (j - values[i].x) + values[i].y;
        res.push(newy / 100)
      }
    }
    res.push(values[values.length - 1].y / 100);
    return res;
  }

  function diff(values1, values2) {
    let res1 = calculate(values1);
    let res2 = calculate(values2);
    let res = [];
    for (let i = 0; i < res1.length; i++) {
      res.push((res1[i] - res2[i]) * 100);
    }
    console.log(res);
    return res;
  }

  function loadNetWorth() {
    const cash = JSON.parse(localStorage.getItem('investments-0')) || [
            {
              x: 20, y: 100
            },
            {
              x: 100, y: 100
            }
        ];
    const bonds = JSON.parse(localStorage.getItem('investments-1')) || [
            {x: 20, y: 75}, {x: 100, y: 75}
        ];
    const stocks = JSON.parse(localStorage.getItem('investments-2')) || [
      {x: 20, y: 25}, {x: 100, y: 25}
    ];
    const savings = JSON.parse(localStorage.getItem('salary')) || [
            {
              x: 20, y: 50000
            },
            {
              x: 100, y: 500000
            }
        ];
    const budget = JSON.parse(localStorage.getItem('budget-0')) || [
      {x: 20, y: 28000}, {x: 100, y: 30000}
    ];

    let info = {
      "time_series": {
        "cash": calculate(cash),
        "stocks": calculate(stocks),
        "bonds": calculate(bonds),
        "savings": diff(savings, budget),
      },
      "start_year": parseInt(startYear),
      "num_sims": 1000
    };

    const length = info["time_series"]["cash"].length;

    for (let i = 0; i < length; i++) {
      info["time_series"]["cash"][i] -= info["time_series"]["stocks"][i];
      info["time_series"]["stocks"][i] -= info["time_series"]["bonds"][i];
    }

    for (let i = 0; i < length; i++) {
      console.log(info["time_series"]["cash"][i] + info["time_series"]["bonds"][i] + info["time_series"]["stocks"][i] );
    }

    console.log(info)
    const method = simSelected ? 'monte-carlo' : 'backtest';
    fetch(`http://127.0.0.1:5000/compute-${method}`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(info)
    }).then(res => res.json()).then(data => {
      let mx = 0;
      if (method === 'monte-carlo') {
        let temp = [];
        for (let i = 20; i <= 100; i++)
          temp.push({x: i, y: data.time_series.mid[i - 20]});
        setNetWorth(temp);

        temp = [];
        for (let i = 20; i <= 100; i++)
          temp.push({x: i, y: data.time_series.low[i - 20]});
        setNetWorthLow(temp);

        temp = [];
        for (let i = 20; i <= 100; i++) {
          temp.push({x: i, y: data.time_series.high[i - 20]});
          mx = Math.max(mx, data.time_series.high[i - 20]);
        }
        setNetWorthHigh(temp);
        setMaxRange(mx * 1.1);
      } else {
        let temp = [];
        for (let i = 20; i < 20 + data.time_series.net_worth.length; i++) {
          let val = data.time_series.net_worth[i - 20];
          if (!isNaN(val)) {
            mx = Math.max(mx, val);
            temp.push({x: i, y: val});
          }
        }
        setNetWorth(temp);
        setNetWorthLow([])
        setNetWorthHigh([])
        setMaxRange(mx * 1.1);
      }
    }).catch(err => {
      alert(err)
    });
  }

  useEffect(loadNetWorth, [bump]);

  const POINT_PROPS = {
    pointHitRadius: 5,
    pointRadius: 0,
    pointHoverRadius: 5,
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
        label: 'Net Worth Mid',
        yAxisID: 'y1',
        dragData: false,
        data: netWorth,
        backgroundColor: "lightgreen",
        borderColor: "green",
        order: 2,
        ...POINT_PROPS,
      }, {
        label: 'Net Worth Low',
        yAxisID: 'y2',
        dragData: false,
        data: netWorthLow,
        backgroundColor: "lightblue",
        borderColor: "blue",
        order: 1,
        ...POINT_PROPS,
      }, {
        label: 'Net Worth High',
        yAxisID: 'y3',
        dragData: false,
        data: netWorthHigh,
        backgroundColor: "salmon",
        borderColor: "red",
        order: 3,
        ...POINT_PROPS,
      }]
    },
    options: {
      scales: {
        y1: {
          type: 'linear',
          max: maxRange,
          min: 0,
          ticks: {
            color: 'white'
          }
        },
        y2: {
          type: 'linear',
          max: maxRange,
          min: 0,
          display: false,
          ticks: {
            color: 'white'
          }
        },
        y3: {
          type: 'linear',
          max: maxRange,
          min: 0,
          display: false,
          ticks: {
            color: 'white'
          }
        },
        x: {
          ticks: {
            color: 'white'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: "white",  
            font: {
              size: 18 
            }
          }
        }
      },
      onHover: function(e) {
        const point = e.chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false)
        if (point.length) e.native.target.style.cursor = 'grab'
        else e.native.target.style.cursor = 'default'
      },
      responsive: true,
      maintainAspectRatio: false,
    }
  }

  function update() {
    loadNetWorth();
  }

  function handleChange (e) {
    e.preventDefault()
    setStartYear(e.target.value);
  }
  return (
    <>
      <div id="popup-modal" tabIndex="-1" style={{display: startYearModalOpen ? 'block' : 'none'}}
           className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full">
        <div className="relative p-4 w-full max-w-md h-full md:h-auto m-auto" style={{
          top: "50%",
          transform: "translateY(-50%)"
        }}>
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button type="button"
                    className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
                    data-modal-toggle="popup-modal"
                    onClick={() => {setStartYearModalOpen(false)}}
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                   xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"></path>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
            <div className="p-6 text-center text-black">
              <input type={"text"} value={startYear} onChange={handleChange} />
              <br />
              <button className={"text-white mt-2"} onClick={(e) => {
                setStartYearModalOpen(false)
                update()
              }}>Submit</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flow-root px-4">
        <div className="float-left space-x-4 mb-4">
          <a>Start Year:</a>
          <button
            className={"bg-transparent transition-colors hover:bg-blue-500 hover:bg-opacity-50 text-white py-1 px-4 border border-blue-700 rounded"}
            onClick={()=>setStartYearModalOpen(true)}
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
              onClick={()=>setSimSelected(true)}
            >
              Simulate
            </button>
            <button
              className={
                (simSelected ? "bg-gray-300" : "bg-blue-400") +
                " transition-colors hover:bg-gray-400 text-gray-800 font-bold py-1 px-4 rounded-r-md"
              }
              onClick={()=>setSimSelected(false)}
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
  )

}