// client/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import MemeGenerator from "./components/MemeGenerator";
import "./App.css";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<MemeGenerator />} />
        </Routes>
      </Router>

      <ToastContainer />
    </>
  );
}

export default App;
