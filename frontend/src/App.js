import React from "react";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import LandingPage from "./components/LandinPage";
import Register from "./components/Register";
import Login from "./components/LogIn"; 
import Search from "./components/Search"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;