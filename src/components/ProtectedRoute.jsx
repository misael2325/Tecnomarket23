import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, userStatus, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  // Not logged in -> Login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin access
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Pending users (except admin)
  if (userStatus === 'pending' && !isAdmin) {
    return <Navigate to="/pending-approval" replace />;
  }

  // Rejected users
  if (userStatus === 'rejected' && !isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'white', padding: '20px', textAlign: 'center' }}>
        <div>
          <h2 style={{ color: '#ef4444' }}>Acceso Denegado</h2>
          <p>Tu solicitud de registro ha sido rechazada. Contacta al administrador.</p>
          <button onClick={() => window.location.href = '/'} className="btn" style={{ marginTop: '20px' }}>Volver</button>
        </div>
      </div>
    );
  }

  return children;
}
