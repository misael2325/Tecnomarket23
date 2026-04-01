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
      <nav>
        <Link to="/" className="nav-brand">
          <span className="material-icons">smartphone</span>
          {settings.storeName}
        </Link>
        <div className="nav-links">
          <a href="#" className="active">Inicio</a>
          <a href="#nosotros">Acerca de</a>
          {isAdmin && <Link to="/admin" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Panel CMS</Link>}
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>{currentUser.email}</span>
              </div>
              <button onClick={() => logout()} className="btn btn-outline" style={{ padding: '6px 15px', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline" style={{ padding: '6px 20px', fontSize: '0.85rem' }}>
              Iniciar Sesión
            </Link>
          )}
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '8px 20px', background: '#25D366', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WhatsAppIcon />
            Contáctanos
          </a>
        </div>
      </nav>

      {/* ACTIVE CAMPAIGN BANNER */}
      {primaryOffer && (
        <div style={{
          background: primaryOffer.bgColor || '#0f172a',
          backgroundImage: primaryOffer.image ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${primaryOffer.image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: `3px solid ${primaryOffer.accentColor || '#00f0ff'}`,
          padding: '20px 5%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          textAlign: 'center',
          animation: 'fadeIn 0.5s ease',
        }}>
          <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>{primaryOffer.emoji}</span>
          <div style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: '1.3rem', marginRight: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {primaryOffer.name}
            </span>
            {primaryOffer.discount > 0 && (
              <span style={{
                background: primaryOffer.accentColor || '#00f0ff',
                color: '#000',
                fontWeight: 800,
                padding: '6px 16px',
                borderRadius: '12px',
                fontSize: '1.1rem',
                boxShadow: `0 0 20px ${primaryOffer.accentColor || '#00f0ff'}88`,
              }}>
                {primaryOffer.discount}% OFF
              </span>
            )}
            {primaryOffer.description && (
              <p style={{ color: 'rgba(255,255,255,0.9)', margin: '8px 0 0', fontSize: '1rem', fontWeight: 500 }}>
                {primaryOffer.description}
              </p>
            )}
          </div>
          {primaryOffer.endDate && (
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '5px 15px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>
                ⏳ Termina: {primaryOffer.endDate}
              </span>
            </div>
          )}
        </div>
      )}

      <header className="hero" style={{ 
        backgroundImage: settings.heroImage ? `linear-gradient(to bottom, rgba(10,10,12,0.6) 0%, rgba(10,10,12,1) 100%), url(${settings.heroImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="hero-content">
          <div className="badge">{settings.heroBadge}</div>
          <h1 style={{ background: 'none', WebkitTextFillColor: 'initial', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', marginBottom: '15px' }}>
            <span style={{ color: '#ff3131', fontSize: '1.2em', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '1px' }}>{settings.heroTitle}</span>
            <span style={{ color: '#3b82f6', fontSize: '0.9em', fontWeight: 800, letterSpacing: '4px' }}>{settings.heroTitleHighlight}</span>
          </h1>
          <p>{settings.heroDescription}</p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/catalog" className="btn">
              Ver Catálogo
              <span className="material-icons">arrow_forward</span>
            </Link>
            {activeOffers.length > 0 && (
              <Link to="/catalog" className="btn btn-outline" style={{ borderColor: primaryOffer.accentColor || 'var(--primary)', color: primaryOffer.accentColor || 'var(--primary)', background: 'rgba(0,0,0,0.3)' }}>
                {primaryOffer.emoji} Ver Ofertas
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ACTIVE OFFERS SECTION */}
      {activeOffers.length > 0 && (
        <section className="section" id="ofertas" style={{ paddingTop: '80px', paddingBottom: '60px' }}>
          <div className="section-title">
            <h2>🎉 Campañas Activas</h2>
            <p>Descubre nuestras promociones especiales vigentes ahora mismo.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto', padding: '0 5%' }}>
            {activeOffers.map(offer => (
              <div key={offer.id} style={{
                background: offer.bgColor || 'var(--bg-card)',
                backgroundImage: offer.image ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${offer.image})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: `2px solid ${offer.accentColor || 'var(--primary)'}`,
                borderRadius: '24px',
                padding: '40px 30px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '15px',
                boxShadow: `0 20px 40px ${offer.accentColor}22`,
                transition: 'transform 0.3s',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>{offer.emoji}</span>
                <h3 style={{ color: 'white', fontSize: '1.8rem', margin: 0, fontWeight: 900 }}>{offer.name}</h3>
                {offer.discount > 0 && (
                  <div style={{ background: offer.accentColor || '#00f0ff', color: '#000', fontWeight: 900, fontSize: '2.5rem', padding: '10px 30px', borderRadius: '15px', boxShadow: `0 0 30px ${offer.accentColor}66` }}>
                    {offer.discount}% OFF
                  </div>
                )}
                {offer.description && <p style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>{offer.description}</p>}
                {offer.endDate && <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>📅 Válido hasta {offer.endDate}</p>}
                <Link to="/catalog" className="btn" style={{ marginTop: '15px', background: offer.accentColor || 'var(--primary)', color: '#000', border: 'none', width: '100%', fontWeight: 800 }}>
                  Aprovechar Oferta <span className="material-icons">local_fire_department</span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ABOUT SECTION */}
      <section className="section" id="nosotros">
        <div className="about-grid">
          <div className="about-text">
            <h2>{settings.aboutTitle}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '1.05rem', lineHeight: '1.8' }}>{settings.aboutP1}</p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '1.05rem', lineHeight: '1.8' }}>{settings.aboutP2}</p>
            
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '15px 35px', background: '#25D366', border: 'none', display: 'flex', alignItems: 'center', gap: '10px', width: 'fit-content' }}>
              <WhatsAppIcon />
              Hablar con un Experto
            </a>
            <div style={{ marginTop: '30px', display: 'flex', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{settings.stat1Value}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{settings.stat1Label}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{settings.stat2Value}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{settings.stat2Label}</span>
              </div>
            </div>
          </div>
          <div>
            <img src={settings.aboutImage} alt="Interior Tienda" style={{ width: '100%', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)' }} />
          </div>
        </div>
      </section>

      {/* WHY US SECTION */}
      {settings.whyUsItems && settings.whyUsItems.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-title">
            <h2>¿Por qué elegirnos?</h2>
            <p>Las razones por las que miles de clientes confían en nosotros.</p>
          </div>

          {/* General section image (optional) */}
          {settings.whyUsSectionImage && (
            <div style={{ maxWidth: '1200px', margin: '0 auto 30px', padding: '0 5%' }}>
              <img
                src={settings.whyUsSectionImage}
                alt="¿Por qué elegirnos?"
                style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', borderRadius: '20px', border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                onError={e => e.target.style.display='none'}
              />
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '20px',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 5%',
          }}>
            {settings.whyUsItems.map((item, idx) => (
              <div key={item.id || idx} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'transform 0.3s, border-color 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
              >
                <span style={{ fontSize: '2.5rem' }}>{item.icon}</span>
                <h3 style={{ color: 'white', margin: 0, fontSize: '1.1rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* INSTAGRAM SECTION */}
      {settings.socialInstagram && settings.instagramPhotos && settings.instagramPhotos.length > 0 && (
        <section className="section" style={{ background: 'rgba(255,255,255,0.02)', padding: '80px 5%' }}>
          <div className="section-title">
            <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <span className="material-icons" style={{ fontSize: '2.5rem', color: '#E1306C' }}>camera_alt</span>
              Síguenos en Instagram
            </h2>
            <p>Mira nuestras novedades y promociones exclusivas en redes sociales.</p>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px', 
            maxWidth: '1000px', 
            margin: '0 auto 40px' 
          }}>
            {settings.instagramPhotos.map((photo, idx) => (
              <div key={idx} style={{ 
                aspectRatio: '1/1', 
                overflow: 'hidden', 
                borderRadius: '12px', 
                border: '1px solid var(--glass-border)',
                background: '#111'
              }}>
                <img src={photo} alt={`Instagram ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} 
                  onMouseEnter={e => e.target.style.transform = 'scale(1.1)'} 
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'} 
                />
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="btn" style={{ 
              background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)', 
              border: 'none',
              padding: '12px 30px',
              fontWeight: 800
            }}>
              Ir a Instagram
            </a>
          </div>
        </section>
      )}

      <footer id="contacto">
        <div className="footer-content">
          <div style={{ textAlign: 'left' }}>
            <div className="nav-brand" style={{ marginBottom: '10px' }}>
              <span className="material-icons">smartphone</span>
              {settings.storeName}
            </div>
            <p style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>
              {settings.footerDesc}
            </p>
          </div>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ color: 'white', marginBottom: '15px', fontSize: '1.1rem' }}>Contacto Directo</h4>
            <a 
              href={settings.locationLat && settings.locationLng 
                ? `https://www.google.com/maps?q=${settings.locationLat},${settings.locationLng}`
                : `https://www.google.com/maps/search/${encodeURIComponent(settings.contactAddress || '')}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
              className="hover-primary"
            >
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>location_on</span>
              {settings.contactAddress}
            </a>
            <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', background: 'rgba(37, 211, 102, 0.1)', padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(37, 211, 102, 0.3)', width: 'fit-content' }}>
              <WhatsAppIcon />
              {settings.contactPhone}
            </a>
            {settings.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <span className="material-icons" style={{ fontSize: '1.2rem' }}>mail</span>
                {settings.contactEmail}
              </a>
            )}
          </div>
          <div className="social-links">
            {settings.socialFacebook && <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer"><span className="material-icons">facebook</span></a>}
            {settings.socialInstagram && <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer"><span className="material-icons">camera_alt</span></a>}
            {settings.contactEmail && <a href={`mailto:${settings.contactEmail}`}><span className="material-icons">mail</span></a>}
          </div>
        </div>
        <div className="copyright">
          <p>© 2026 {settings.storeName}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </>
  );
}
