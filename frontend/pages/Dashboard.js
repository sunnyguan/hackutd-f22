import InvestmentChart from "./InvestmentChart";
import MovableChart from "./MovableChart";
import SalaryChart from "./SalaryChart";
import {useState} from "react";
import Budget from "./Budget";
import MiscItems from "./MiscItems";

export default function Dashboard () {

  const [id, setId] = useState(0);

  function update() {
    setId(Math.random());
  }

  return (
      <div className={"flex flex-col"}>
        <div className={"flex-1"}>
          <InvestmentChart bump={id}/>
        </div>
        <hr />
        <div className={"grid grid-cols-4 divide-x text-center"}>
          <MovableChart update={update}/>
          <SalaryChart update={update}/>
          <Budget update={update}/>
          <MiscItems />
        </div>
      </div>
  )
}