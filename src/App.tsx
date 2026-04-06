import { Tooltip } from 'primereact/tooltip';
import { HashRouter, Route, Routes } from 'react-router';
import BabyDevice from './components/BabyDevice';
import ParentDevice from './components/ParentDevice';
import SelectDeviceRole from './components/SelectDeviceRole';
import UserSettings from './components/UserSettings';

function App() {
  const isTouchDevice = window && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<SelectDeviceRole />}></Route>
          <Route path="/baby-device" element={<BabyDevice />}></Route>
          <Route path="/parent-device" element={<ParentDevice />}></Route>
          <Route path="/settings" element={<UserSettings />}></Route>
        </Routes>
      </HashRouter>

      {
        !isTouchDevice &&
        <Tooltip target="[data-pr-tooltip]" position="bottom" />
      }
    </>
  );
}

export default App;
