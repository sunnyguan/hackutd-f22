import InvestmentChart from "./InvestmentChart";
import PortfolioChart from "./PortfolioChart";
import SalaryChart from "./SalaryChart";
import { useState } from "react";
import Budget from "./Budget";
import MiscItems from "./MiscItems";

export default function ChartSelector({ update }) {
  const [chart, setChart] = useState("Portfolio");

  const options = {
    Portfolio: <PortfolioChart update={update} />,
    Salary: <SalaryChart update={update} />,
    Budget: <Budget update={update} />,
    "Large Purchases": <MiscItems update={update} />,
  };

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
