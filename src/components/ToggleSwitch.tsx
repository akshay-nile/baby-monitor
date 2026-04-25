import { useEffect, useState } from 'react';

type Props = { checked: boolean, onChange: (b: boolean) => void, id: string }

function ToggleSwitch({ checked, onChange, id }: Props) {
    const [isChecked, setIsChecked] = useState(checked);

    useEffect(() => { setIsChecked(checked); }, [checked]);

    return (
        <div className="w-19 h-10 flex items-center border border-pink-500 rounded-full cursor-pointer scale-80 group"
            onClick={() => { const newChecked = !isChecked; onChange(newChecked); setIsChecked(newChecked); }}>
            <div className={`w-8 h-8 rounded-full transition-all ease-in-out duration-200 relative
                            ${isChecked ? 'bg-pink-500 group-hover:bg-pink-600 translate-x-10' : 'bg-gray-500 translate-x-1'}`} />
            <input type="checkbox" id={id} className="hidden w-0 h-0 p-0 m-0" />
        </div>
    );
}

export default ToggleSwitch;
