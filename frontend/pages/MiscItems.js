function Item({name, down, loan, rate, age}) {
  return (
      <div className={"text-sm text-center border-2 border-red-500 rounded-2xl w-full py-2"}>
        <div className={"font-bold mb-1"}>{name}</div>
        <div>Initial Payment: {down}</div>
        <div>Remaining Payment: {loan}</div>
        <div>Interest Rate: {rate}</div>
        <div>Initial Payment Age: {age}</div>
      </div>
  )
}

export default function MiscItems() {
  return (
      <div className={"flex flex-col"}>
        <div className={"text-2xl"}>Large Purchases</div>
        <div className={"w-full mt-4 space-y-2 px-16"}>
          <Item name={"Student Loans"} down={"$10,000"} loan={"$90,000"} rate={"3.7%"} age={20} />
          <Item name={"Car"} down={"$40,000"} loan={"$22,000"} rate={"4.4%"} age={25} />
          <Item name={"House"} down={"$400,000"} loan={"$320,000"} rate={"7.3%"} age={32} />
        </div>
      </div>
  )
}