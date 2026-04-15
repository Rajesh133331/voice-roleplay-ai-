import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Roleplay from "./pages/Roleplay";
import Score from "./pages/Score";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<Roleplay />} />
        <Route path="/score" element={<Score />} />
      </Routes>
    </BrowserRouter>
  );
}
