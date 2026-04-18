import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router';
import BabyDevice from './components/BabyDevice';
import ParentDevice from './components/ParentDevice';
import SelectDeviceRole from './components/SelectDeviceRole';
import UserSettings from './components/UserSettings';

function App() {
  const location = useLocation();

  return (
    <div className="x-0 p-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<SelectDeviceRole />} />
          <Route path="/baby-device" element={<BabyDevice />} />
          <Route path="/parent-device" element={<ParentDevice />} />
          <Route path="/settings" element={<UserSettings />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
