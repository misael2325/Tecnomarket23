import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Admin from './pages/Admin';

import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="bg-gradient"></div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/device/:id" element={<ProductDetails />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
