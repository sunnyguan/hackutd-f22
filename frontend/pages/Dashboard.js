import InvestmentChart from "./InvestmentChart";
import MovableChart from "./MovableChart";
import SalaryChart from "./SalaryChart";
import {useState} from "react";

export default function Dashboard () {

  const [id, setId] = useState(0);

  function update() {
    setId(Math.random());
  }

  return (
      <div className={"flex flex-col"}>
        <div className={"flex-1"}>
          <InvestmentChart key={id}/>
        </div>
        <div className={"grid grid-cols-3 divide-x text-center"}>
          <MovableChart update={update}/>
          <SalaryChart update={update}/>
          <div>c</div>
        </div>
      </div>
  )
}