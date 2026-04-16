import { Baby, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from './Header';

function SelectDeviceRole() {
    const navigate = useNavigate();

    return (
        <div className="w-full md:w-1/2 lg:w-1/3 mx-auto min-h-dvh flex flex-col justify-between items-center p-4 bg-white text-white select-none duration-300 transition-all">
            <Header />

            <div className="w-full flex flex-col items-center gap-16 my-auto">
                <h1 className="text-gray-800 text-2xl font-semibold">
                    Select a role for this device
                </h1>

                <button className={styles.bigButton} onClick={() => navigate('/baby-device')}>
                    <Baby size="70" strokeWidth={1.5} />
                    <div className={styles.bigBtnText}>
                        <span className="text-xl">Use as Baby Device</span>
                        <span>(Camera & Microphone)</span>
                    </div>
                </button>

                <button className={styles.bigButton} onClick={() => navigate('/parent-device')}>
                    <Users size="70" strokeWidth={1.5} />
                    <div className={styles.bigBtnText}>
                        <span className="text-xl">Use as Parent Device</span>
                        <span>(Display & Speakers)</span>
                    </div>
                </button>
            </div>
        </div >
    );
}

export default SelectDeviceRole;

const styles = {
    bigButton: 'w-full flex justify-center items-center gap-4 bg-pink-500 hover:bg-pink-600 px-6 py-4 rounded-2xl shadow-lg shadow-gray-300 cursor-pointer',
    bigBtnText: 'flex flex-col items-center gap-1 font-bold',
    iconButton: '',
};