import MovableChart from "./MovableChart";
import Header from "./Header";
import {useEffect, useState} from "react";
import SalaryChart from "./SalaryChart";
import Dashboard from "./Dashboard";
import LandingPage from "./LandingPage"
import Budget from "./Budget";

export const headers = ["Dashboard", "Investments", "Salary", "Budget"];

function Switch({tab}) {
  if (tab === "Investments") {
    return <MovableChart />
  } else if (tab === "Salary") {
    return <SalaryChart />
  } else if (tab === "Dashboard") {
    return <Dashboard />
  } else if (tab === "Budget") {
    return <Budget update={() => {}}/>
  }
}

export default function Home() {
  const [tab, setTab] = useState("Dashboard");
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let info = localStorage.getItem('info');
    if (info) {
      setInfo(info);
    }
  }, []);

  function signUpDone(data) {
    setInfo(data);
    localStorage.setItem('info', data);
  }

  return (
      <div style={{backgroundImage: "linear-gradient(180deg, #1F2833, #000000)", minHeight: '100vh', color: '#ffffff', fontSize: '25px'}}>
        {info ? <>
        <Header tab={tab} setTab={setTab} />
        <div className={"mx-9"}>
          <h1 className={"text-5xl text-center m-10 font-bold drop-shadow-[5px_5px_10px_#66A2FC]"} >
            {tab}
          </h1>
          <Switch tab={tab} />
        </div>
        </> : <LandingPage signUpDone={signUpDone}/>}
      </div>
  )
}