import React from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { settings = {} } = useInventory();
  const { currentUser, isAdmin, logout } = useAuth();

  // WhatsApp link
  const rawPhone = (settings.contactPhone || '').replace(/\D/g, '');
  const waLink = `https://wa.me/${rawPhone}?text=${encodeURIComponent('Hola, me interesa uno de sus equipos disponibles 📱')}`;

  return (
    <>
      <nav className="glass-effect">
        <Link to="/" className="nav-brand">
          {settings.storeName || 'Sailin Tecno'}
        </Link>
        <div className="nav-links">
          <Link to="/" className="active">Inicio</Link>
          <Link to="/catalog">Catálogo</Link>
          {isAdmin && <Link to="/admin" style={{ color: 'var(--primary)' }}>Admin</Link>}
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {currentUser ? (
            <button onClick={() => logout()} className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
              Salir
            </button>
          ) : (
            <Link to="/login" className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
              Entrar
            </Link>
          )}
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '10px 24px' }}>
            Contáctanos
          </a>
        </div>
      </nav>

      <section className="hero">
        <span className="badge">Tecnología a tu alcance</span>
        <h1>
          Domina el Mañana con <span>{settings.heroTitle || 'Hardware de Élite'}</span>
        </h1>
        <p>
          {settings.heroSubtitle || settings.heroDescription || 'Tu destino tecnológico de confianza. Equipos de alta gama, accesorios originales y el mejor servicio técnico garantizado.'}
        </p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/catalog" className="btn">
            Ir al Catálogo <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
          <a href="#about" className="btn btn-outline">
            Saber Más
          </a>
        </div>
      </section>

      {/* WHY CHOOSE US - CLASSIC */}
      <section className="section" style={{ background: 'var(--surface-container-lowest)' }}>
        <div className="section-title">
          <span className="badge">Nuestra Diferencia</span>
          <h2>¿Por qué elegir Sailin Tecno?</h2>
          <p>Ofrecemos mucho más que una simple venta; entregamos una experiencia de hardware completa.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ padding: '40px', background: 'var(--surface-container-low)', borderRadius: '24px', border: '1px solid var(--outline-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '20px' }}>verified</span>
            <h3 style={{ marginBottom: '12px' }}>Calidad Certificada</h3>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>Cada equipo es sometido a más de 30 puntos de control técnico antes de ser entregado.</p>
          </div>
          <div style={{ padding: '40px', background: 'var(--surface-container-low)', borderRadius: '24px', border: '1px solid var(--outline-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '20px' }}>support_agent</span>
            <h3 style={{ marginBottom: '12px' }}>Soporte Experto</h3>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>Asesoría personalizada real. No somos solo vendedores, somos técnicos apasionados.</p>
          </div>
          <div style={{ padding: '40px', background: 'var(--surface-container-low)', borderRadius: '24px', border: '1px solid var(--outline-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '20px' }}>security</span>
            <h3 style={{ marginBottom: '12px' }}>Garantía Real</h3>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>Respaldo total en hardware y software para que tu única preocupación sea disfrutar tu equipo.</p>
          </div>
        </div>
      </section>

      <section className="section" id="about">
        <div className="about-grid">
          <div className="about-text">
            <span className="badge">Nuestra Esencia</span>
            <h2>{settings.aboutTitle || 'Excelencia en cada detalle'}</h2>
            <p>{settings.aboutDesc || 'En Sailin Tecno entendemos que tu smartphone es tu herramienta más importante. Por eso, seleccionamos solo hardware de élite que cumpla con los más altos estándares de rendimiento y estética.'}</p>
            {(settings.aboutQuote) && (
              <div style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '24px', marginTop: '32px' }}>
                <p style={{ fontStyle: 'italic', color: 'var(--primary)' }}>"{settings.aboutQuote}"</p>
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <img 
              src={settings.aboutImage || 'https://images.unsplash.com/photo-1556656793-062ff98782fe?auto=format&fit=crop&q=80&w=800'} 
              alt="Nuestra Historia" 
              style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', objectFit: 'cover', maxHeight: '500px' }}
            />
          </div>
        </div>
      </section>

      {/* Testimonials / Reviews Section */}
      {settings.reviews && settings.reviews.length > 0 && (
        <section className="section" style={{ background: 'var(--surface-container-highest)' }}>
          <div className="section-title">
            <span className="badge" style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>Nuestra Comunidad</span>
            <h2>Nuestros clientes hablan por nosotros</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto' }}>Descubre por qué somos la opción número uno de miles de clientes satisfechos en el país.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1400px', margin: '0 auto', padding: '0 5%' }}>
            {settings.reviews.map(review => (
              <div key={review.id} style={{ 
                background: 'var(--surface-container-low)', 
                padding: '32px', 
                borderRadius: 'var(--xl-radius)', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px',
                border: '1px solid var(--outline-variant)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '50%', 
                    background: 'var(--tertiary)', color: 'var(--on-tertiary)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontWeight: 900, fontSize: '1.2rem', flexShrink: 0 
                  }}>
                    {review.initials || review.name?.substring(0, 2).toUpperCase() || '✨'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--on-surface)' }}>{review.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: '#fbbc04' }}>star</span>
                      {review.rating}
                    </span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>"{review.text}"</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer>
        <div className="footer-content">
          <div>
            <h2 className="nav-brand" style={{ fontSize: '2rem', marginBottom: '20px' }}>{settings.storeName}</h2>
            <p style={{ color: 'var(--on-surface-variant)', maxWidth: '400px' }}>{settings.footerDesc || 'Entregando la mejor tecnología de alta gama.'}</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Horarios</h4>
            <div style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>
              <p style={{ marginBottom: '12px' }}><strong style={{ color: 'var(--on-surface)' }}>Lunes - Viernes</strong><br/>9:00 a.m. a 6:30 p.m.</p>
              <p style={{ marginBottom: '12px' }}><strong style={{ color: 'var(--on-surface)' }}>Sábados</strong><br/>No laboramos</p>
              <p><strong style={{ color: 'var(--on-surface)' }}>Domingos</strong><br/>9:30 a.m. a 1:00 p.m.</p>
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Ubicación</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--on-surface-variant)' }}>{settings.contactAddress}</p>
            <p style={{ fontWeight: 800 }}>{settings.contactPhone}</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Redes</h4>
            <div className="social-links">
              {settings.socialFacebook && (
                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer">
                  <span className="material-symbols-outlined">facebook</span>
                </a>
              )}
              {settings.socialInstagram && (
                <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer">
                  <span className="material-symbols-outlined">camera_alt</span>
                </a>
              )}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', borderTop: '1px solid var(--outline-variant)', paddingTop: '40px', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
          © 2026 {settings.storeName}. Todos los derechos reservados.
        </div>
      </footer>
    </>
  );
}
