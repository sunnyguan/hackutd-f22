import MovableChart from "./MovableChart";
import { useEffect, useState } from "react";
import SalaryChart from "./SalaryChart";
import Dashboard from "./Dashboard";
import LandingPage from "./LandingPage";
import Budget from "./Budget";

export const headers = [
  ["Dashboard", "#0aadff"],
  ["Investments", "#ffb01f"],
  ["Salary", "#10bc2d"],
  ["Budget", "#cd6590"],
];

function Switch({ tab }) {
  if (tab === "Investments") {
    return <MovableChart update={() => {}} />;
  } else if (tab === "Salary") {
    return <SalaryChart update={() => {}} />;
  } else if (tab === "Dashboard") {
    return <Dashboard />;
  } else if (tab === "Budget") {
    return <Budget update={() => {}} />;
  }
}

export default function Home() {
  const [tab, setTab] = useState("Dashboard");
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let info = localStorage.getItem("info");
    if (info) {
      setInfo(info);
    }
  }, []);

  function signUpDone(data) {
    setInfo(data);
    localStorage.setItem("info", data);
  }

  return (
    <div
      style={{
        backgroundImage: "linear-gradient(180deg, #1F2833, #000000)",
        minHeight: "100vh",
        color: "#ffffff",
        fontSize: "25px",
      }}
    >
      {info ? (
        <>
          <div className={"flex w-full p-4 mx-auto justify-center"}>
            <div
              className={
                "text-[#007AB8] cursor-pointer p-2 mx-4 " +
                (tab === "Dashboard" ? "font-bold" : "font-normal")
              }
              onClick={(e) => {
                setTab("Dashboard");
              }}
            >
              {"Dashboard"}
            </div>
            <div
              className={
                "text-[#ffb01f] cursor-pointer p-2 mx-4 " +
                (tab === "Investments" ? "font-bold" : "font-normal")
              }
              onClick={(e) => {
                setTab("Investments");
              }}
            >
              {"Investments"}
            </div>
            <div
              className={
                "text-[#10bc2d] cursor-pointer p-2 mx-4 " +
                (tab === "Salary" ? "font-bold" : "font-normal")
              }
              onClick={(e) => {
                setTab("Salary");
              }}
            >
              {"Salary"}
            </div>
            <div
              className={
                "text-[#cd6590] cursor-pointer p-2 mx-4 " +
                (tab === "Budget" ? "font-bold" : "font-normal")
              }
              onClick={(e) => {
                setTab("Budget");
              }}
            >
              {"Budget"}
            </div>
          </div>
          <div className={"mx-9"}>
            <h1
              className={
                "text-5xl text-center mx-10 font-bold drop-shadow-[5px_5px_10px_#66A2FC]"
              }
            >
              {tab}
            </h1>
            <Switch tab={tab} />
          </div>
        </>
      ) : (
        <LandingPage signUpDone={signUpDone} />
      )}
    </div>
  );
}
