import { Baby, CircleQuestionMark, Download, Settings, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import usePWAInstaller from '../hooks/usePWAInstaller';
import { browserID } from '../services/settings';

function SelectDeviceRole() {
    const navigate = useNavigate();
    const [isPWAInstalled, showPWAInstallPrompt] = usePWAInstaller('baby-monitor-pwa');
    const gotoGitHubPage = () => window.location.href = 'https://github.com/akshay-nile/baby-monitor/blob/main/README.md';

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className="flex flex-col gap-1">
                    <span className="text-lg font-bold">Browser ID</span>
                    <span className={styles.browserID}>{browserID}</span>
                </div>

                <div className="flex gap-3 items-center">
                    {!isPWAInstalled && <Download size="40" className={styles.iconButton} onClick={showPWAInstallPrompt} />}
                    <CircleQuestionMark size="40" className={styles.iconButton} onClick={gotoGitHubPage} />
                    <Settings size="40" className={styles.iconButton} onClick={() => navigate('/settings')} />
                </div>
            </div>

            <div className="flex flex-col items-center gap-16 my-auto">
                <button className={styles.bigButton} onClick={() => navigate('/baby-device')}>
                    <Baby size="75" strokeWidth={1.5} />
                    <div className={styles.bigBtnText}>
                        <span className="text-xl">Use as Baby Device</span>
                        <span>(Camera & Microphone)</span>
                    </div>
                </button>

                <button className={styles.bigButton} onClick={() => navigate('/parent-device')}>
                    <Users size="75" strokeWidth={1.5} />
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
    container: 'w-full md:w-1/2 lg:w-1/3 mx-auto min-h-dvh flex flex-col justify-between items-center p-4 text-white select-none duration-300 transition-all',
    header: 'w-full flex justify-between items-center p-4 bg-pink-500 rounded-lg shadow-gray-200 shadow',
    browserID: 'text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded font-mono select-text',
    bigButton: 'w-full flex justify-between items-center gap-1 bg-pink-500 hover:bg-pink-600 px-6 py-4 rounded-2xl shadow-gray-400 shadow-lg cursor-pointer',
    bigBtnText: 'flex flex-col items-center gap-1 font-bold',
    iconButton: 'hover:text-blue-300 cursor-pointer',
};