import { getOrDefault } from "../pages/Defaults";

export function calculate(values, div) {
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

export function diff(values1, values2) {
  let res1 = calculate(values1, 1);
  let res2 = calculate(values2, 1);
  let res = [];
  for (let i = 0; i < res1.length; i++) {
    res.push(res1[i] - res2[i]);
  }
  return res;
}

export function aggregate_info() {
  const [cash, bonds, stocks] = getOrDefault("investments");
  console.log([cash, bonds, stocks]);
  const savings = getOrDefault("salary")[0];
  const budget = getOrDefault("budgets")[0];
  const loans = getOrDefault("budgets")[3];

  let info = {
    cash: calculate(cash, 100),
    stocks: calculate(stocks, 100),
    bonds: calculate(bonds, 100),
    savings: diff(savings, budget),
    loans: calculate(loans, 1),
  };

  const length = info["cash"].length;

  for (let i = 0; i < length; i++) {
    info["cash"][i] -= info["bonds"][i];
    info["bonds"][i] -= info["stocks"][i];
  }

  return info;
}

export function getChartData(data, method) {
  let mx = 0;
  let mn = 0;
  let netWorth = [];
  let netWorthLow = [];
  let netWorthHigh = [];
  if (method === "monte-carlo") {
    for (let i = 20; i <= 100; i++)
      netWorth.push({ x: i, y: data.time_series.mid[i - 20] });
    for (let i = 20; i <= 100; i++)
      netWorthLow.push({ x: i, y: data.time_series.low[i - 20] });
    for (let i = 20; i <= 100; i++) {
      netWorthHigh.push({ x: i, y: data.time_series.high[i - 20] });
      mx = Math.max(mx, data.time_series.high[i - 20]);
      mn = Math.min(mn, data.time_series.high[i - 20]);
    }
  } else {
    for (let i = 20; i < 20 + data.time_series.net_worth.length; i++) {
      let val = data.time_series.net_worth[i - 20];
      if (!isNaN(val)) {
        mx = Math.max(mx, val);
        mn = Math.min(mn, val);
        netWorthHigh.push({ x: i, y: val });
      }
    }
  }
  mx *= 1.1;
  mn -= 1000;
  return [netWorth, netWorthLow, netWorthHigh, mx, mn];
}
