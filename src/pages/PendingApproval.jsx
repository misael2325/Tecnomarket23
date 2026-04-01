import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PendingApproval() {
  const { logout, userStatus } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  }

  // If already approved, redirect to home
  if (userStatus === 'approved') {
    navigate('/');
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-dark)',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '500px',
        padding: '50px 30px',
        background: 'var(--bg-card)',
        borderRadius: '30px',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
        animation: 'fadeIn 0.6s ease'
      }}>
        <div style={{ marginBottom: '25px' }}>
          <span className="material-icons" style={{ fontSize: '5rem', color: '#f59e0b', marginBottom: '20px' }}>hourglass_empty</span>
          <h2 style={{ color: 'white', fontSize: '2rem', margin: '0 0 10px 0' }}>Cuenta en Revisión</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Tu registro ha sido enviado exitosamente. Un administrador debe aprobar tu cuenta antes de que puedas acceder al catálogo de equipos.
          </p>
        </div>

        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', marginBottom: '30px' }}>
          <p style={{ color: 'white', margin: 0, fontSize: '0.9rem' }}>
            Recibirás acceso una vez que hayamos verificado tus datos. ¡Gracias por tu paciencia!
          </p>
        </div>

        <button 
          onClick={handleLogout}
          className="btn btn-outline" 
          style={{ padding: '12px 40px', fontWeight: 700 }}
        >
          Cerrar Sesión y Volver
        </button>
      </div>
    </div>
  );
}
