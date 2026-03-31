import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Catalog from './pages/Catalog';
import Admin from './pages/Admin';
import { InventoryProvider } from './context/InventoryContext';
import './index.css';

function App() {
  return (
    <InventoryProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/device/:id" element={<ProductDetails />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </InventoryProvider>
  );
}

export default App;
