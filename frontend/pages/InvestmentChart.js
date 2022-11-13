import { Chart as ChartJS } from 'chart.js/auto'
import { Chart }            from 'react-chartjs-2'
import {useEffect, useRef, useState} from "react";
import 'chartjs-plugin-dragdata'
import MovableChart from "./MovableChart";
import SalaryChart from "./SalaryChart";

export default function InvestmentChart({id}) {

  const chartRef = useRef(null);
  const [netWorth, setNetWorth] = useState([]);
  const [netWorthLow, setNetWorthLow] = useState([]);
  const [netWorthHigh, setNetWorthHigh] = useState([]);
  const [maxRange, setMaxRange] = useState(200000);



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
      "start_year": 1957,
      "num_sims": 5000
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

    fetch('http://127.0.0.1:5000/compute-monte-carlo', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(info)
    }).then(res => res.json()).then(data => {
      let temp = [];
      for (let i = 20; i <= 100; i++)
        temp.push({x: i, y: data.time_series.mid[i-20]});
      setNetWorth(temp);

      temp = [];
      for (let i = 20; i <= 100; i++)
        temp.push({x: i, y: data.time_series.low[i-20]});
      setNetWorthLow(temp);

      temp = [];
      let mx = 0;
      for (let i = 20; i <= 100; i++) {
        temp.push({x: i, y: data.time_series.high[i-20]});
        mx = Math.max(mx, data.time_series.high[i-20]);
      }
      setNetWorthHigh(temp);

      setMaxRange(mx * 1.1);
    }).catch(err => {
      alert(err)
    });
  }

  useEffect(loadNetWorth, []);

  const POINT_PROPS = {
    pointHitRadius: 5,
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