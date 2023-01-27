import { useState } from "react";
import StackEditChart from "./StackEditChart";
import MiscItems from "./MiscItems";

export function save(datasets, name) {
  let combined = [];
  for (let dataset of datasets) combined.push(dataset.data);
  localStorage.setItem(name, JSON.stringify(combined));
}

export function getCharts(update, height = "200px") {
  return {
    Portfolio: (
      <StackEditChart
        key={1}
        update={update}
        name={"investments"}
        line_options={[
          {
            label: "Cash",
            backgroundColor: "rgba(255, 219, 153, 0.25)",
            borderColor: "rgb(255, 219, 153)",
          },
          {
            label: "Bonds",
            backgroundColor: "rgba(255, 176, 31, 0.25)",
            borderColor: "rgb(255, 176, 31)",
          },
          {
            label: "Stocks",
            backgroundColor: "rgba(102, 66, 0, 0.25)",
            borderColor: "rgb(102, 66, 0)",
          },
        ]}
        add_point_props={{ tension: 0.2 }}
        add_scale_props={{ max: 100 }}
        height={height}
      />
    ),
    Salary: (
      <StackEditChart
        key={2}
        update={update}
        name={"salary"}
        line_options={[
          {
            label: "Salary",
            backgroundColor: "rgba(20, 225, 54, 0.25)",
            borderColor: "rgb(20, 225, 54)",
          },
        ]}
        add_scale_props={{ max: 200000 }}
        height={height}
      />
    ),
    Budget: (
      <StackEditChart
        key={3}
        update={update}
        name={"budgets"}
        line_options={[
          {
            label: "Rent",
            backgroundColor: "rgba(240, 209, 222, 0.25)",
            borderColor: "rgb(240, 209, 222)",
          },
          {
            label: "Food",
            backgroundColor: "rgba(220, 147, 178, 0.25)",
            borderColor: "rgb(220, 147, 178)",
          },
          {
            label: "Transportation",
            backgroundColor: "rgba(200, 86, 133, 0.25)",
            borderColor: "rgb(200, 86, 133)",
          },
          {
            label: "Loans",
            backgroundColor: "rgba(172, 53, 104, 0.25)",
            borderColor: "rgb(172, 53, 104)",
          },
        ]}
        add_point_props={{ tension: 0.2 }}
        add_scale_props={{ max: 100000 }}
        height={height}
      />
    ),
    "Large Purchases": <MiscItems update={update} />,
  };
}

export default function ChartSelector({ update }) {
  const [chart, setChart] = useState("Portfolio");
  const options = getCharts(update);

  return (
    <div>
      <div>{options[chart]}</div>
      <div className={"grid grid-cols-4 text-center mt-4"}>
        {Object.keys(options).map((option) => (
          <div
            key={option}
            className={chart === option ? "font-bold" : "" + " cursor-pointer"}
            onClick={(_) => {
              setChart(option);
            }}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
}
