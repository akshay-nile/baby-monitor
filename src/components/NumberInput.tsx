import { useEffect, useState } from 'react';

type Props = { value: number, min: number, max: number, onChange: (n: number) => void, id: string };

function NumberInput({ value, min, max, onChange, id }: Props) {
    const [number, setNumber] = useState<number>(value);

    useEffect(() => { setNumber(value); }, [value]);

    function changeValueBy(step = 0) {
        let newNumber = number + step;
        if (newNumber > max) newNumber = +max;
        if (newNumber < min) newNumber = +min;
        onChange(newNumber);
        setNumber(newNumber);
    }

    return (
        <div className="flex justify-center items-center h-10 rounded-lg border border-pink-500 scale-90 m-0">
            <button className="h-10 w-9 text-2xl px-2.5 rounded-l-lg cursor-pointer bg-pink-500 text-white hover:bg-pink-600 disabled:bg-neutral-500"
                onClick={() => changeValueBy(-1)} disabled={number <= min}>‒</button>
            <input type="text" className="h-10 w-10 text-lg text-center border border-pink-500" disabled readOnly
                value={number} id={id} />
            <button className="h-10 w-10 text-2xl px-2.5 rounded-r-lg cursor-pointer bg-pink-500 text-white hover:bg-pink-600 disabled:bg-neutral-500"
                onClick={() => changeValueBy(+1)} disabled={number >= max}>+</button>
        </div >
    );
}

export default NumberInput;