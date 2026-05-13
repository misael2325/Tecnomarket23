import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { login, resetPassword, loginWithGoogle, loginWithFacebook } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setMessage('');
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
    if (!email) {
      setError('Por favor ingresa tu correo electrónico primero.');
      return;
    }
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Se ha enviado un correo de recuperación a ' + email + '. Revisa tu bandeja de entrada y spam.');
    } catch (err) {
      console.error("Reset Password Error:", err.code);
      if (err.code === 'auth/user-not-found') {
        setError('No existe ninguna cuenta con este correo electrónico.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiadas solicitudes. Intenta de nuevo en unos minutos.');
      } else {
        setError('Error al enviar el correo de recuperación. Verifica el correo e intenta de nuevo.');
      }
    } finally {
      setLoading(false);
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
          <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Ingresa a tu cuenta de STS | SAILIN TECNO</p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
        {message && <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(34, 197, 94, 0.2)' }}>{message}</div>}

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
              required={!message} // Not required if we just want to reset password
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
            {loading ? 'Procesando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ margin: '0 10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>O continuar con</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            onClick={async () => { await loginWithGoogle(); navigate(from, { replace: true }); }}
            className="btn btn-outline" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <i className="fa-brands fa-google" style={{ color: '#ea4335', fontSize: '1.2rem' }}></i> Google
          </button>
          <button 
            type="button" 
            onClick={async () => { await loginWithFacebook(); navigate(from, { replace: true }); }}
            className="btn btn-outline" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <i className="fa-brands fa-facebook" style={{ color: '#1877f2', fontSize: '1.2rem' }}></i> Facebook
          </button>
        </div>

        <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            type="button"
            onClick={handleResetPassword} 
            disabled={loading}
            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, opacity: loading ? 0.5 : 1 }}
          >
            ¿Olvidaste tu contraseña?
          </button>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>Regístrate aquí</Link>
          </div>
              </div>
      </div>
    </div>
  );
}
