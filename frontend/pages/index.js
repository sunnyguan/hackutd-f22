import MovableChart from "./MovableChart";
import Header from "./Header";
import {useState} from "react";
import SalaryChart from "./SalaryChart";
import InvestmentChart from "./InvestmentChart";

export const headers = ["Home", "Budget", "Investments", "Salary"];

function Switch({tab}) {
  if (tab === "Investments") {
    return <MovableChart />
  } else if (tab === "Salary") {
    return <SalaryChart />
  } else if (tab === "Home") {
    return <InvestmentChart />
  }
}

export default function Home() {
  const [tab, setTab] = useState("Investments");

  return (
      <>
        <Header tab={tab} setTab={setTab} />
        <div className={"mx-8"}>
          <h1 className={"text-2xl text-center m-4"}>{tab}</h1>
          <Switch tab={tab} />
        </div>
      </>
  )
}