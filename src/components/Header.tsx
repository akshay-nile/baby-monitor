import { Baby, CircleQuestionMark, Download, Settings, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import usePWAInstaller from '../hooks/usePWAInstaller';
import { getBrowserID } from '../services/settings';

const browserID = getBrowserID();
type Props = { children?: ReactNode, screen?: 'baby' | 'parent' | 'settings' };

function Header({ children, screen }: Props) {
    const navigate = useNavigate();
    const [isPWAInstalled, installPrompt] = usePWAInstaller('baby-monitor-pwa');

    const gotoGithub = () => window.open('https://github.com/akshay-nile/baby-monitor/blob/main/README.md');

    let content = <></>;
    if (screen === 'baby') content = <Baby size="30" strokeWidth="2.4" />;
    if (screen === 'parent') content = <User size="28" strokeWidth="2.5" />;
    if (screen === 'settings') content = <Settings size="30" strokeWidth="2.4" />;

    if (!children) return (
        <div className="w-full flex justify-between items-center p-4 bg-pink-500 rounded-lg shadow">
            <div className="flex items-center gap-3">
                <img src="./favicon.png" width="40px" />
                <span className="text-xl font-bold">Baby Monitor</span>
            </div>
            <div className="flex gap-3 items-center">
                {
                    !isPWAInstalled && installPrompt !== null &&
                    <Download size="35" className="hover:text-blue-300 cursor-pointer" onClick={() => installPrompt.prompt()} />
                }
                <CircleQuestionMark size="35" className="hover:text-blue-300 cursor-pointer" onClick={gotoGithub} />
                <Settings size="35" className="hover:text-blue-300 cursor-pointer" onClick={() => navigate('/settings')} />
            </div>
        </div>
    );
    else return (
        <div className="w-full flex justify-between items-center p-4 bg-pink-500 rounded-lg shadow">
            <div className="w-full flex justify-between items-center">
                <span className="flex items-center gap-2 text-lg font-bold">{content}{children}</span>
                <span className="text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded font-mono select-text">{browserID}</span>
            </div>
        </div>
    );
}

export default Header;