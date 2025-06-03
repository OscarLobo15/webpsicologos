import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Register from "./components/Register";
import Login from "./components/LogIn";
import Search from "./components/Search";
import Profile from "./components/Profile";
import PsDetails from "./components/PsDetails"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/psychologist/:id" element={<PsDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
