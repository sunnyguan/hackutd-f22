import { useState } from "react";

function Calculator() {
  const brackets = [
    [37, 539900],
    [35, 215950],
    [32, 170050],
    [24, 89075],
    [22, 41775],
    [12, 10275],
    [10, 0],
  ];
  const FICA = 0.0765;
  const standardDeduction = 12950;
  const re = /^[0-9\b]+$/;
  const [income, setIncome] = useState(0);
  const [taxed, setTaxed] = useState(0);

  function updateIncome(e) {
    if (e.target.value === "" || re.test(e.target.value)) {
      const inc = e.target.value;
      setIncome(inc);
      setTaxed(getTaxedIncome(inc));
    }
  }

  function getTaxedIncome(inc) {
    const val = bracketCalculator(inc - standardDeduction) + standardDeduction;
    const fica = FICA * inc;
    return Math.round(val - fica);
  }

  function bracketCalculator(inc) {
    for (const bracket of brackets) {
      if (inc > bracket[1]) {
        return (
          (inc - bracket[1]) * (1 - bracket[0] / 100) +
          bracketCalculator(bracket[1])
        );
      }
    }
    return 0;
  }

  return (
    <div className={"grid grid-cols-2 m-8 text-sm"}>
      <div className={"border-2 border-gray rounded-xl p-4"}>
        <input
          value={income}
          onChange={updateIncome}
          className={"text-black p-4 rounded-2xl"}
          placeholder={"Enter your income here"}
        />
        <div className={"mt-4"}>Post-tax income: {taxed}</div>
      </div>
    </div>
  );
}

export default Calculator;
