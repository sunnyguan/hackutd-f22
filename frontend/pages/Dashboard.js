import InvestmentChart from "./InvestmentChart";
import { useState } from "react";
import ChartSelector from "./ChartSelector";

export default function Dashboard() {
  const [id, setId] = useState(0);

  function update() {
    setId(Math.random());
  }

  return (
    <div className={"flex flex-col"}>
      <div className={"flex-1 flex flex-col"}>
        <InvestmentChart bump={id} />
      </div>
      <hr />
      <ChartSelector update={update} />
    </div>
  );
}
