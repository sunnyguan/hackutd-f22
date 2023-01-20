import img from "../images/rocket.png";
import React, { useState } from "react";
import Input from "./Input";
import Dashboard from "./Dashboard";

const signupFields = [
  {
    labelText: "Full Name",
    labelFor: "full-name",
    id: "fullname",
    name: "fullname",
    type: "text",
    autoComplete: "fullname",
    isRequired: true,
    placeholder: "Full Name",
  },
  {
    labelText: "Age",
    labelFor: "age",
    id: "age",
    name: "age",
    type: "integer",
    autoComplete: "age",
    isRequired: true,
    placeholder: "Age",
  },
  {
    labelText: "Email address",
    labelFor: "email-address",
    id: "email-address",
    name: "email",
    type: "email",
    autoComplete: "email",
    isRequired: true,
    placeholder: "Email Address",
  },
  {
    labelText: "Password",
    labelFor: "password",
    id: "password",
    name: "password",
    type: "password",
    autoComplete: "current-password",
    isRequired: true,
    placeholder: "Password",
  },
];

export default function LandingPage({ signUpDone }) {
  const [visibleItem, setVisibleItem] = useState("start");

  return (
    <>
      {/* <img className={"mx-9"} src={img} /> */}
      <h1
        className={
          "flex text-5xl text-center p-10 font-bold items-center justify-center"
        }
      >
        Financial Planner
      </h1>
      <p className={"text-center"}>Financial planning made easy.</p>
      <div className={"flex items-center justify-center mb-3"}>
        {visibleItem === "start" && (
          <>
            <button
              className={
                "bg-white hover:bg-sky-300 text-gray-800 font-semibold py-4 px-7 border border-sky-300 rounded shadow hover:shadow-lg mx-5"
              }
              onClick={() => setVisibleItem("signup")}
            >
              Get Started
            </button>
            <button
              className={
                "bg-white hover:bg-sky-300 text-gray-800 font-semibold py-4 px-7 border border-sky-300 rounded shadow hover:shadow-lg m-8"
              }
              onClick={() => setVisibleItem("signin")}
            >
              Sign In
            </button>
          </>
        )}

        {visibleItem === "signin" && (
          <div className="my-8 block rounded-lg shadow-lg bg-white max-w-sm text-center text-black h-5/6 w-3/6">
            <h2 className="font-bold my-8">Sign Up</h2>
            <form className="my-8">
              <h2 className="my-8">Email</h2>
              <input
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                type="text"
                placeholder="Email"
              ></input>
              <h2 className="my-8">Password</h2>
              <input
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                type="password"
                placeholder="Password"
              ></input>
            </form>
            <button className="mb-8 text-base bg-white hover:bg-gray-400 text-gray-800 font-semibold py-4 px-7 border border-gray-300 rounded shadow hover:shadow-lg">
              Sign In
            </button>
          </div>
        )}

        {visibleItem === "signup" && (
          <div className="my-8 block rounded-lg shadow-lg bg-white max-w-sm text-center text-black h-5/6 w-3/6">
            <h2 className="font-bold my-8">Let's Get Started!</h2>
            <form className="m-4">
              {signupFields.map((field) => (
                <div key={field.id} className={"my-4 mx-4"}>
                  <h2 className="font-bold text-left text-xl mb-2">
                    {field.placeholder}
                  </h2>
                  <Input
                    key={field.id}
                    labelText={field.labelText}
                    labelFor={field.labelFor}
                    id={field.id}
                    name={field.name}
                    type={field.type}
                    isRequired={field.isRequired}
                    placeholder={field.placeholder}
                  ></Input>
                </div>
              ))}
            </form>
            <button
              className="mb-8 text-base bg-white hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded shadow hover:shadow-lg"
              onClick={(e) => {
                signUpDone({
                  name: "Nhi",
                });
              }}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </>
  );
}
