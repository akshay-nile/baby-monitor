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
        alert("Screen Wake-Lock Failed!");
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
  )
}

export default App
