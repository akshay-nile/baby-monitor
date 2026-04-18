import { Baby, CircleQuestionMark, Download, Settings, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import usePWAInstaller from '../hooks/usePWAInstaller';
import { browserID } from '../services/settings';

type Props = { children?: ReactNode };

function Header({ children }: Props) {
    const navigate = useNavigate();
    const [isPWAInstalled, installPrompt] = usePWAInstaller('baby-monitor-pwa');

    const gotoGithub = () => window.open('https://github.com/akshay-nile/baby-monitor/blob/main/README.md');

    if (!children) return (
        <div className="w-full flex justify-between items-center p-4 bg-pink-500 rounded-lg shadow">
            <div className="flex flex-col gap-1">
                <span className="text-lg font-bold">Browser ID</span>
                <span className="text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded font-mono select-text">{browserID}</span>
            </div>

            <div className="flex gap-3 items-center">
                {
                    !isPWAInstalled && installPrompt !== null &&
                    <Download size="40" className="hover:text-blue-300 cursor-pointer" onClick={() => installPrompt.prompt()} />
                }
                <CircleQuestionMark size="40" className="hover:text-blue-300 cursor-pointer" onClick={gotoGithub} />
                <Settings size="40" className="hover:text-blue-300 cursor-pointer" onClick={() => navigate('/settings')} />
            </div>
        </div>
    );
    else return (
        <div className="w-full flex justify-between items-center p-4 bg-pink-500 rounded-lg shadow">
            <div className="w-full flex justify-between">
                {
                    children.toString().startsWith('Baby')
                        ? <span className="flex items-center gap-2 text-lg font-bold"><Baby size="30" strokeWidth="2.4" />{children}</span>
                        : <span className="flex items-center gap-2 text-lg font-bold"><User size="28" strokeWidth="2.5" />{children}</span>
                }
                <span className="text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded font-mono select-text">{browserID}</span>
            </div>
        </div>
    );
}

export default Header;