import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      let msg = 'Error al iniciar sesión.';
      if (err.code === 'auth/invalid-credential') msg = 'Correo o contraseña incorrectos.';
      if (err.code === 'auth/user-not-found') msg = 'Este correo no está registrado.';
      if (err.code === 'auth/wrong-password') msg = 'Contraseña incorrecta.';
      if (err.code === 'auth/too-many-requests') msg = 'Demasiados intentos fallidos. Intenta más tarde.';
      
      setError(msg);
      console.error("Login Error:", err.code);
    }
    setLoading(false);
  }

  async function handleResetPassword() {
    if (!email) return alert('Por favor ingresa tu correo para restablecer la contraseña.');
    try {
      await resetPassword(email);
      alert('Se ha enviado un correo para restablecer tu contraseña.');
    } catch (err) {
      alert('Error al intentar enviar el correo. Verifica el email escrito.');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #1e293b, #0f172a)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '10px' }}>lock</span>
          <h2 style={{ color: 'white', margin: 0, fontSize: '1.8rem' }}>Bienvenido</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Ingresa a tu cuenta de Capital Celular</p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', display: 'block', marginLeft: '5px' }}>Correo Electrónico</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none' }}
              placeholder="tu@email.com"
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', display: 'block', marginLeft: '5px' }}>Contraseña</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none' }}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn" 
            style={{ width: '100%', padding: '14px', marginTop: '10px', fontSize: '1rem', fontWeight: 700 }}
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button onClick={handleResetPassword} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>¿Olvidaste tu contraseña?</button>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>Regístrate aquí</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
