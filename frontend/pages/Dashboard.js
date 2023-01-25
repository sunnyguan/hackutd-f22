import InvestmentChart from "./InvestmentChart";
import PortfolioChart from "./PortfolioChart";
import SalaryChart from "./SalaryChart";
import { useState } from "react";
import Budget from "./Budget";
import MiscItems from "./MiscItems";
import ChartSelector from "./ChartSelector";

export default function Dashboard() {
  const [id, setId] = useState(0);

  function update() {
    setId(Math.random());
  }

  return (
    <div className={"flex flex-col"}>
      <div className={"flex-1"}>
        <InvestmentChart bump={id} />
      </div>
      <hr />
      <ChartSelector update={update}/>
    </div>
  );
}
