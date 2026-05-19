import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ScoutPage } from "./pages/ScoutPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/scout/pitcher" element={<ScoutPage />} />
        <Route path="*" element={<Navigate to="/scout/pitcher" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
