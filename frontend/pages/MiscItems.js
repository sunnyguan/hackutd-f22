function Item({name, down, loan, rate, age}) {
  return (
      <div className={"py-4 text-sm text-center border-2 border-red-200 rounded-2xl w-full"}>
        <div>{name}</div>
        <div>Down: {down}</div>
        <div>Loan: {loan}</div>
        <div>Rate: {rate}</div>
        <div>Age: {age}</div>
      </div>
  )
}

export default function MiscItems() {
  return (
      <div className={"flex flex-col"}>
        <div className={"text-2xl"}>Miscellaneous</div>
        <div className={"flex w-full mt-8"}>
          <Item name={"House"} down={"400,000"} loan={"320,000"} rate={"7.3%"} age={32} />
          <Item name={"Car"} down={"40,000"} loan={"22,000"} rate={"4.4%"} age={25} />
          <Item name={"Student Loans"} down={"10,000"} loan={"90,000"} rate={"3.7%"} age={20} />
        </div>
      </div>
  )
}