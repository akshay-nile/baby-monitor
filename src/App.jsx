import { HashRouter, Routes, Route } from "react-router-dom";
import SelectRole from "./components/SelectRole";
import BabyDevice from "./components/BabyDevice";
import ParentDevice from "./components/ParentDevice";
import Settings from "./components/Settings";
import { useState, useEffect, useCallback, useRef } from "react";

function App() {
  const timeoutRef = useRef(null);
  const [toast, setToast] = useState({ text: "Toast Message!", visible: false });

  useEffect(() => { takeWakeLock(); });

  async function takeWakeLock() {
    try { await navigator?.wakeLock?.request("screen"); }
    catch { console.warn("Screen Wake-Lock Failed!"); }
  }

  const showToast = useCallback((text) => {
    if (timeoutRef.current) {
      setToast({ ...toast, visible: false });
      clearTimeout(timeoutRef.current);
    }
    setToast({ visible: true, text });
    timeoutRef.current = setTimeout(() => setToast({ ...toast, visible: false }), 3000);
  }, [toast]);

  return (<>
    <HashRouter>
      <Routes>
        <Route path="/" element={<SelectRole />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/baby-device" element={<BabyDevice showToast={showToast} />} />
        <Route path="/parent-device" element={<ParentDevice showToast={showToast} />} />
      </Routes>
    </HashRouter>
    {toast.visible && <div className="toast no-select">{toast.text}</div>}
  </>);
}

export default App;
