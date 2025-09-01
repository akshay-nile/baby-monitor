import { HashRouter, Routes, Route } from "react-router-dom";
import SelectRole from "./components/SelectRole";
import BabyDevice from "./components/BabyDevice";
import ParentDevice from "./components/ParentDevice";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    async function takeWakeLock() {
      try {
        await navigator?.wakeLock?.request("screen");
      } catch {
        console.log("Screen Wake-Lock Failed!");
        setTimeout(takeWakeLock, 1 * 60 * 1000);
      }
    }
    takeWakeLock();
  });

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SelectRole />} />
        <Route path="/baby-device" element={<BabyDevice />} />
        <Route path="/parent-device" element={<ParentDevice />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
