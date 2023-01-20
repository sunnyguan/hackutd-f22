import { useState } from "react";
import { headers } from "./index";

function HeaderItem({ name, tab, setTab }) {
  return (
    <div
      className={
        "cursor-pointer p-2 mx-4 " +
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

export default function Header({ tab, setTab }) {
  function changeTab(name) {
    setTab(name);
  }

  return (
    <div className={"flex w-full p-4 mx-auto justify-center"}>
      {headers.map((header) => (
        <HeaderItem name={header} tab={tab} key={header} setTab={setTab} />
      ))}
    </div>
  );
}
