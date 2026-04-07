import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }

    try {
      setError('');
      setLoading(true);
      await signup(name, email, password);
      navigate('/pending-approval');
    } catch (err) {
      let msg = 'Error al crear la cuenta.';
      if (err.code === 'auth/email-already-in-use') msg = 'Este correo ya está en uso.';
      if (err.code === 'auth/weak-password') msg = 'La contraseña es muy débil (mínimo 6 caracteres).';
      if (err.code === 'auth/invalid-email') msg = 'El correo no es válido.';
      if (err.code === 'auth/operation-not-allowed') msg = 'El inicio de sesión con correo está desactivado en Firebase.';
      
      setError(msg);
      console.error("Firebase Error:", err.code, err.message);
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at bottom left, #1e293b, #0f172a)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '35px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '10px' }}>person_add</span>
          <h2 style={{ color: 'white', margin: 0, fontSize: '1.8rem' }}>Crea tu Cuenta</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Solicita acceso al sistema de STS | SAILIN TECNO</p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', display: 'block', marginLeft: '5px' }}>Nombre Completo</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '0.95rem', outline: 'none' }}
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', display: 'block', marginLeft: '5px' }}>Correo Electrónico</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '0.95rem', outline: 'none' }}
              placeholder="tu@email.com"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', display: 'block', marginLeft: '5px' }}>Contraseña</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '0.95rem', outline: 'none' }}
                placeholder="••••••••"
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', display: 'block', marginLeft: '5px' }}>Confirmar</label>
              <input 
                type="password" 
                required 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '0.95rem', outline: 'none' }}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div style={{ textAlign: 'left', marginTop: '10px', padding: '15px', background: 'rgba(0, 240, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 240, 255, 0.1)' }}>
            <p style={{ color: 'var(--primary)', fontSize: '0.8rem', margin: 0, lineHeight: '1.4' }}>
              <strong>Nota Importante:</strong> Al registrarte, tu cuenta quedará en estado <strong>Pendiente</strong>. Un administrador deberá aprobar tu solicitud antes de que puedas acceder al catálogo completo.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn" 
            style={{ width: '100%', padding: '14px', marginTop: '10px', fontSize: '1rem', fontWeight: 700 }}
          >
            {loading ? 'Creando cuenta...' : 'Solicitar Acceso'}
          </button>
        </form>

        <div style={{ marginTop: '25px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>Inicia Sesión</Link>
        </div>
      </div>
    </div>
  );
}
