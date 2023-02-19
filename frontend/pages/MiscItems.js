import { useEffect, useState } from "react";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function Item({ name, down, loan, rate, age, index, remove }) {
  return (
    <div
      className={
        "text-sm text-center border-2 border-blue-500 rounded-2xl w-full py-2"
      }
    >
      <button
        className={"px-2 py-1 bg-red-800 rounded-xl mb-2"}
        onClick={(e) => {
          remove(index);
        }}
      >
        Remove
      </button>
      <div className={"font-bold mb-1"}>{name}</div>
      <div>Initial Payment: {formatter.format(down)}</div>
      <div>Remaining Payment: {formatter.format(loan)}</div>
      <div>Interest Rate: {Math.round(rate * 10000) / 100 + "%"}</div>
      <div>Initial Payment Age: {formatter.format(age)}</div>
    </div>
  );
}

function Input({ value, setValue, prompt, numbersOnly = true }) {
  const re = /^[0-9\\.\b]+$/;
  return (
    <div className={"my-2"}>
      <div className={""}>{prompt}:</div>
      <input
        value={value}
        className={"text-black"}
        onChange={(e) => {
          if (numbersOnly) {
            if (e.target.value === "" || re.test(e.target.value)) {
              setValue(e.target.value);
            }
          } else {
            setValue(e.target.value);
          }
        }}
      />
    </div>
  );
}

export default function MiscItems({ update }) {
  const [items, setItems] = useState([]);

  const [name, setName] = useState("");
  const [initial, setInitial] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [interest, setInterest] = useState(0);
  const [age, setAge] = useState(0);

  useEffect(() => {
    let info = localStorage.getItem("expenses");
    if (info) {
      setItems(JSON.parse(info));
    }
  }, []);

  function addItem() {
    let newItems = [
      ...items,
      {
        initial: initial,
        remaining: remaining,
        interest: interest,
        age: age,
        name: name,
      },
    ];
    save(newItems);
    setName("");
    setInitial(0);
    setRemaining(0);
    setInterest(0);
    setAge(0);
  }

  function save(newItems) {
    setItems(newItems);
    localStorage.setItem("expenses", JSON.stringify(newItems));
    update();
  }

  return (
    <div className={"flex flex-col mt-4"}>
      <div className={"grid grid-cols-2 gap-4"}>
        <Item
          name={"Student Loans"}
          down={"10000"}
          loan={"90000"}
          rate={"0.037"}
          age={20}
        />
        <Item
          name={"Car"}
          down={"40000"}
          loan={"22000"}
          rate={"0.044"}
          age={25}
        />
        <Item
          name={"House"}
          down={"400000"}
          loan={"320000"}
          rate={"0.073"}
          age={32}
        />
        {items.map((item, index) => (
          <Item
            key={item.remaining}
            name={item.name}
            down={item.initial}
            loan={item.remaining}
            rate={item.interest}
            age={item.age}
            index={index}
            remove={(idx) => {
              save(items.filter((_, index) => index !== idx));
            }}
          />
        ))}
        <div className={"text-sm border-2 border-blue-500 rounded-xl p-4"}>
          <div className={"text-lg font-bold mb-2"}>New Item</div>
          <div className={""}>
            <Input
              value={name}
              setValue={setName}
              prompt={"Name"}
              numbersOnly={false}
            />
            <Input
              value={initial}
              setValue={setInitial}
              prompt={"Initial Payment"}
            />
            <Input
              value={remaining}
              setValue={setRemaining}
              prompt={"Remaining Payment"}
            />
            <Input
              value={interest}
              setValue={setInterest}
              prompt={"Interest Rate"}
            />
            <Input
              value={age}
              setValue={setAge}
              prompt={"Initial Payment Age:"}
            />
            <button
              className={"px-2 py-1 bg-blue-400 rounded-xl"}
              onClick={addItem}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
