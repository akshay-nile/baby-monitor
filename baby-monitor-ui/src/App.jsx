import { BrowserRouter, Routes, Route } from "react-router-dom";
import SelectRole from "./components/SelectRole";
import BabyDevice from "./components/BabyDevice";
import ParentDevice from "./components/ParentDevice";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SelectRole />} />
        <Route path="/baby-device" element={<BabyDevice />} />
        <Route path="/parent-device" element={<ParentDevice />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
