import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { InventoryProvider } from './context/InventoryContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetails from './pages/ProductDetails'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Register from './pages/Register'
import PendingApproval from './pages/PendingApproval'
import './index.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <InventoryProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/device/:id" element={<ProductDetails />} />
            
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <Admin />
              </ProtectedRoute>
            } />
          </Routes>
        </InventoryProvider>
      </AuthProvider>
    </Router>
  )
}

export default App;
