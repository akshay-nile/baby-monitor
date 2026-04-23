import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Panel } from 'primereact/panel';
import { useEffect, useState } from 'react';
import type { Settings } from '../services/models';
import { getSettings, resetSettings, setSettings } from '../services/settings';
import Header from './Header';
import NumberInput from './NumberInput';
import PageAnimation from './PageAnimation';
import ToggleSwitch from './ToggleSwitch';

function UserSettings() {
    const settings = getSettings();
    const [userSettings, setUserSettings] = useState<Settings>(settings);

    useEffect(() => { setSettings(userSettings); }, [userSettings]);

    return (
        <PageAnimation>
            <div className="w-full md:w-1/2 lg:w-1/3 mx-auto min-h-dvh flex flex-col justify-between items-center p-4 text-white bg-neutral-800 rounded-xl select-none duration-300 transition-all">
                <Header screen="settings">User Settings</Header>

                <div className="w-full flex flex-col gap-5">
                    <Panel header="Baby Device Settings" className="w-full">
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-center">
                                <label htmlFor="startWithCamera">Always Start With</label>
                                <Dropdown id="startWithCamera" optionLabel="name" pt={{ input: { style: { padding: '0.4rem 0.8rem', border: '1px solid pink' } }, trigger: { style: { display: 'none' } } }}
                                    options={[{ name: 'Front Camera', value: 'user' }, { name: 'Back Camera', value: 'environment' }]}
                                    value={userSettings.startWithCamera}
                                    onChange={e => setUserSettings({ ...userSettings, startWithCamera: e.value })} />
                            </div>
                            <div className="flex justify-between items-center">
                                <label htmlFor="maxParentConnections">Max Parent Connections</label>
                                <NumberInput id="maxParentConnections" min={1} max={5}
                                    value={userSettings.maxParentConnections}
                                    onChange={value => setUserSettings({ ...userSettings, maxParentConnections: value })} />
                            </div>
                            <div className="flex justify-between items-center">
                                <label htmlFor="pollingTimeout">Polling Timeout (minutes)</label>
                                <NumberInput id="pollingTimeout" min={1} max={10}
                                    value={userSettings.pollingTimeout}
                                    onChange={value => setUserSettings({ ...userSettings, pollingTimeout: value })} />
                            </div>
                            <div className="flex justify-between items-center">
                                <label>Trusted Parent Devices ({userSettings.trustedParents.length})</label>
                                <Button size="small" label="Clear All" className="h-10"
                                    onClick={() => setUserSettings({ ...userSettings, trustedParents: [] })} />
                            </div>
                        </div>
                    </Panel>

                    <Panel header="Parent Device Settings" className="w-full">
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-center">
                                <label htmlFor="usePushToTalk">Use Push-To-Talk Feature</label>
                                <ToggleSwitch id="usePushToTalk"
                                    checked={userSettings.usePushToTalk}
                                    onChange={value => setUserSettings({ ...userSettings, usePushToTalk: value })} />
                            </div>
                        </div>
                    </Panel>
                </div>

                <Button size="large" label="Reset Settings" onClick={() => setUserSettings(resetSettings())} />
            </div>
        </PageAnimation>
    );
}

export default UserSettings;