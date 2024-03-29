import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import LandingPage from "./LandingPage";
import { getCharts } from "./ChartSelector";
import Calculator from "./Calculator";
import MiscItems from "./MiscItems";

export const headers = [
  ["Dashboard", "#0aadff"],
  ["Portfolio", "#ffb01f"],
  ["Salary", "#10bc2d"],
  ["Budget", "#cd6590"],
];

const options = getCharts(() => {}, "400px");

function Switch({ tab }) {
  if (tab === "Portfolio") {
    return options[tab];
  } else if (tab === "Salary") {
    return options[tab];
  } else if (tab === "Dashboard") {
    return <Dashboard />;
  } else if (tab === "Budget") {
    return options[tab];
  } else if (tab === "Expenses") {
    return <MiscItems />;
  } else if (tab === "Calculator") {
    return <Calculator />;
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

  function TabItem({ name }) {
    return (
      <div
        className={
          "text-gray cursor-pointer p-2 mx-4 " +
          (tab === name ? "font-bold" : "font-normal")
        }
        onClick={(e) => {
          setTab(name);
        }}
      >
        {name}
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundImage: "linear-gradient(180deg, #1F2833, #000000)",
        minHeight: "100vh",
        color: "#ffffff",
        fontSize: "25px",
      }}
      className={"h-full flex flex-col"}
    >
      {info ? (
        <>
          <div className={"flex w-full p-4 mx-auto justify-center"}>
            <TabItem name={"Dashboard"} />
            <TabItem name={"Portfolio"} />
            <TabItem name={"Salary"} />
            <TabItem name={"Budget"} />
            <TabItem name={"Expenses"} />
            <TabItem name={"Calculator"} />
          </div>
          <div className={"mx-9 flex-1 flex flex-col"}>
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
