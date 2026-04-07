import React from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { products, settings, offers } = useInventory();
  const { currentUser, isAdmin, logout } = useAuth();

  // Build WhatsApp link from settings phone
  const rawPhone = (settings.contactPhone || '').replace(/\D/g, '');
  const waLink = `https://wa.me/${rawPhone}?text=${encodeURIComponent('Hola, me interesa uno de sus equipos disponibles 📱')}`;

  const WhatsAppIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.171.823-.298.044-.683.056-1.109-.079-.272-.087-.621-.219-1.07-.417-1.921-.853-3.141-2.859-3.236-2.987-.095-.128-.771-.979-.813-2.022-.043-1.043.518-1.579.742-1.815.143-.143.411-.226.619-.226.238 0 .375.006.536.006.161.006.375-.065.589.44.214.506.738 1.803.803 1.934.065.131.107.283.021.455-.078.156-.123.25-.245.393-.122.143-.257.319-.364.428-.12.122-.244.254-.105.494.139.24.617 1.018 1.328 1.649.914.811 1.684 1.06 1.924 1.18.24.12.381.101.524-.065.143-.166.613-.714.779-.958.165-.244.331-.205.556-.122.226.083 1.433.675 1.679.799.246.124.41.183.469.284.063.103.04.536-.104.941zm-3.413-12.416c-5.523 0-10 4.477-10 10 0 1.714.431 3.326 1.189 4.73l-1.201 4.387 4.534-1.191c1.393.738 2.975 1.164 4.654 1.164 5.522 0 10-4.477 10-10s-4.478-10-10-10zm0 18.25c-1.465 0-2.846-.388-4.043-1.066l-.29-.163-2.695.708.721-2.632-.18-.285c-.752-1.186-1.189-2.599-1.189-4.112 0-4.275 3.477-7.75 7.75-7.75 4.271 0 7.75 3.478 7.75 7.75 0 4.274-3.478 7.75-7.75 7.75z"/>
    </svg>
  );


  // Find currently active offers (active flag + within date range)
  const today = new Date().toISOString().split('T')[0];
  const activeOffers = (offers || []).filter(o =>
    o.active &&
    (!o.startDate || today >= o.startDate) &&
    (!o.endDate || today <= o.endDate)
  );
  const primaryOffer = activeOffers[0] || null;

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
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {currentUser ? (
            <button onClick={() => logout()} className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
              Cerrar Sesión
            </button>
          ) : (
            <Link to="/login" className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
              Entrar
            </Link>
          )}
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '10px 24px', background: 'var(--primary)', color: 'var(--on-primary)' }}>
            Contáctanos
          </a>
        </div>
      </nav>

      {/* HERO SECTION - EDITORIAL STYLE */}
      <header className="hero">
        <div className="absolute inset-0 z-0">
          {settings.heroImage && (
            <img 
              src={settings.heroImage} 
              alt="Hero" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25, filter: 'grayscale(1) contrast(1.1)' }} 
            />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--background) 40%, transparent 100%)' }}></div>
        </div>

        <div className="hero-content" style={{ zIndex: 10, maxWidth: '1000px' }}>
          <span className="badge" style={{ marginBottom: '16px' }}>{settings.heroBadge || 'Digital Curator Edition'}</span>
          <h1 style={{ marginBottom: '24px' }}>
            {settings.heroTitle}
            <span>{settings.heroTitleHighlight}</span>
          </h1>
          <p style={{ fontSize: '1.4rem', fontWeight: 500, color: 'var(--on-surface-variant)', marginBottom: '56px' }}>
            {settings.heroDescription}
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link to="/catalog" className="btn">
              Explorar Colección
              <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>north_east</span>
            </Link>
            {primaryOffer && (
              <a href="#ofertas" className="btn btn-outline">
                Ver {primaryOffer.name}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* BENTO GRID - WHY CHOOSE US */}
      <section className="section" style={{ background: 'var(--surface-container-low)' }}>
        <div className="section-title">
          <span className="badge">Curated Experience</span>
          <h2>La Diferencia Sailin</h2>
          <p>Elevamos el estándar de lo que esperas de un smartphone de alta gama.</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gridAutoRows: 'minmax(200px, auto)',
          gap: '24px', 
          maxWidth: '1600px', 
          margin: '0 auto' 
        }}>
          {settings.whyUsItems?.map((item, idx) => (
            <div key={idx} style={{
              gridColumn: idx === 0 ? 'span 2' : 'span 1',
              gridRow: idx === 0 ? 'span 2' : 'span 1',
              background: idx % 2 === 0 ? 'var(--surface-container-high)' : 'var(--surface-container)',
              borderRadius: 'var(--xl-radius)',
              padding: idx === 0 ? '64px' : '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              transition: 'var(--transition)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <span className="material-symbols-outlined" style={{ 
                fontSize: idx === 0 ? '5rem' : '3.5rem', 
                color: idx % 2 === 0 ? 'var(--primary)' : 'var(--secondary)',
                marginBottom: '24px',
                opacity: 0.8
              }}>
                {idx === 0 ? 'verified_user' : idx === 1 ? 'payments' : 'auto_graph'}
              </span>
              <h3 style={{ 
                fontFamily: 'var(--font-headline)', 
                fontSize: idx === 0 ? '2.5rem' : '1.5rem', 
                fontWeight: 800, 
                marginBottom: '16px',
                letterSpacing: '-1px'
              }}>{item.title}</h3>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: idx === 0 ? '1.2rem' : '1rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EDITORIAL INSTAGRAM GRID */}
      <section className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '80px' }}>
          <div className="section-title" style={{ margin: 0 }}>
            <span className="badge">Social Feed</span>
            <h2>Nuestra Comunidad</h2>
          </div>
          <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ borderRadius: '100px', padding: '12px 24px' }}>
            @sailintecno
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {settings.instagramPhotos?.map((photo, idx) => (
            <div key={idx} style={{ 
              aspectRatio: '1', 
              borderRadius: idx % 2 === 0 ? 'var(--xl-radius)' : '0', 
              overflow: 'hidden',
              transform: idx % 2 !== 0 ? 'translateY(40px)' : 'none'
            }}>
              <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition)' }} />
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER - EDITORIAL LAYOUT */}
      <footer>
        <div className="footer-content">
          <div>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-1.5px', background: 'linear-gradient(to right, var(--primary), var(--primary-container))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {settings.storeName}
            </h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem', maxWidth: '400px' }}>
              {settings.footerDesc}
            </p>
          </div>
          <div>
            <h4 className="form-label" style={{ marginBottom: '24px' }}>Contacto</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '0.95rem' }}>{settings.contactAddress}</p>
              <p style={{ color: 'var(--primary)', fontWeight: 700 }}>{settings.contactPhone}</p>
              <p style={{ color: 'var(--on-surface-variant)' }}>{settings.contactEmail}</p>
            </div>
          </div>
          <div>
            <h4 className="form-label" style={{ marginBottom: '24px' }}>Social</h4>
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
        <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '40px', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>
          © 2026 {settings.storeName}. Digital Curator Edition.
        </div>
      </footer>
    </>
  );
}
