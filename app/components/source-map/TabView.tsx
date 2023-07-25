import {Listbox} from '@headlessui/react'

interface TabViewProps {
    names: string[],
    selectedName: number,
    setSelectedName: (newName: number) => void
}

export default function TabView({names, setSelectedName, selectedName}: TabViewProps) {
    return (
        <Listbox value={selectedName} onChange={setSelectedName} >
            <Listbox.Button
                className="h-9 relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                <span className="truncate">{names[selectedName]}</span>
            </Listbox.Button>
            <Listbox.Options
                className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {names.map((name, index) => (
                    <Listbox.Option
                        key={index}
                        value={index}
                        className={({active}) =>
                            [active ? 'bg-indigo-600 text-white' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9'].join(" ")
                        }
                    >
                        {name}
                    </Listbox.Option>
                ))}
            </Listbox.Options>
        </Listbox>
    )
}