export default function Input({
    handleChange,
    value,
    labelText,
    labelFor,
    id,
    name,
    type,
    isRequired=false,
    placeholder,
}){
    return(
        <div className="">
            <label htmlFor={labelFor} className="sr-only">
              {labelText}
            </label>
            <input
                className="w-full shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-lg"
                onChange={handleChange}
                value={value}
                id={id}
                name={name}
                type={type}
                required={isRequired}
                placeholder={placeholder}
            />
          </div>
    )
}