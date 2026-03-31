import React from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';

export default function Home() {
  const { products, settings, offers } = useInventory();

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
          <a href="#productos">Catálogo</a>
          <a href="#nosotros">Acerca de</a>
          <Link to="/admin" style={{ color: 'var(--text-muted)' }}>Admin</Link>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <a href="#contacto" className="btn btn-outline" style={{ padding: '8px 20px' }}>Contáctanos</a>
        </div>
      </nav>

      {/* ACTIVE CAMPAIGN BANNER */}
      {primaryOffer && (
        <div style={{
          background: primaryOffer.bgColor || '#0f172a',
          borderBottom: `3px solid ${primaryOffer.accentColor || '#00f0ff'}`,
          padding: '14px 5%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          flexWrap: 'wrap',
          textAlign: 'center',
          animation: 'fadeIn 0.5s ease',
        }}>
          <span style={{ fontSize: '1.6rem' }}>{primaryOffer.emoji}</span>
          <div>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', marginRight: '10px' }}>
              {primaryOffer.name}
            </span>
            {primaryOffer.discount > 0 && (
              <span style={{
                background: primaryOffer.accentColor || '#00f0ff',
                color: '#000',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.95rem',
              }}>
                {primaryOffer.discount}% OFF
              </span>
            )}
            {primaryOffer.description && (
              <p style={{ color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', fontSize: '0.9rem' }}>
                {primaryOffer.description}
              </p>
            )}
          </div>
          {primaryOffer.endDate && (
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
              Válido hasta {primaryOffer.endDate}
            </span>
          )}
        </div>
      )}

      <header className="hero">
        <div className="hero-content">
          <div className="badge">{settings.heroBadge}</div>
          <h1>{settings.heroTitle} <span>{settings.heroTitleHighlight}</span></h1>
          <p>{settings.heroDescription}</p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#productos" className="btn">
              Ver Catálogo
              <span className="material-icons">arrow_forward</span>
            </a>
            {activeOffers.length > 0 && (
              <a href="#ofertas" className="btn btn-outline" style={{ borderColor: primaryOffer.accentColor || 'var(--primary)', color: primaryOffer.accentColor || 'var(--primary)' }}>
                {primaryOffer.emoji} Ver Ofertas
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ACTIVE OFFERS SECTION */}
      {activeOffers.length > 0 && (
        <section className="section" id="ofertas" style={{ paddingTop: '60px', paddingBottom: '40px' }}>
          <div className="section-title">
            <h2>🎉 Ofertas Especiales</h2>
            <p>Aprovecha nuestras campañas de temporada con descuentos exclusivos.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto', padding: '0 5%' }}>
            {activeOffers.map(offer => (
              <div key={offer.id} style={{
                background: offer.bgColor || 'var(--bg-card)',
                border: `2px solid ${offer.accentColor || 'var(--primary)'}`,
                borderRadius: '20px',
                padding: '30px 25px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '10px',
                boxShadow: `0 0 30px ${offer.accentColor}33`,
                transition: 'transform 0.3s',
              }}>
                <span style={{ fontSize: '3rem' }}>{offer.emoji}</span>
                <h3 style={{ color: 'white', fontSize: '1.4rem', margin: 0 }}>{offer.name}</h3>
                {offer.discount > 0 && (
                  <div style={{ background: offer.accentColor || '#00f0ff', color: '#000', fontWeight: 800, fontSize: '2rem', padding: '6px 20px', borderRadius: '12px' }}>
                    {offer.discount}% OFF
                  </div>
                )}
                {offer.description && <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: '0.95rem' }}>{offer.description}</p>}
                {offer.endDate && <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '0.8rem' }}>📅 Válido hasta {offer.endDate}</p>}
                <a href="#productos" className="btn" style={{ marginTop: '10px', background: offer.accentColor || 'var(--primary)', color: '#000', border: 'none' }}>
                  Ver Catálogo <span className="material-icons">arrow_forward</span>
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PRODUCTS SECTION */}
      <section className="section" id="productos">
        <div className="section-title">
          <h2>Top Ventas del Mes</h2>
          <p>Equipos premium garantizados. Desbloqueados de fábrica y listos para usar.</p>
        </div>

        <div className="productos">
          {products.map(product => {
            const minPrice = product.stock.length > 0 
              ? Math.min(...product.stock.map(s => s.price)) 
              : product.basePrice;

            return (
              <Link to={`/device/${product.id}`} key={product.id} className="card">
                <div className="card-img-wrapper">
                  <img src={product.image} alt={product.model} />
                </div>
                <div className="card-info">
                  <h3 className="card-title">
                    {product.model}
                    {product.stock.length > 0 && (
                      <span className="stock-badge">Stock: {product.stock.length}</span>
                    )}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '15px' }}>
                    {product.description}
                  </p>
                  <div className="card-price">
                    {primaryOffer && primaryOffer.discount > 0 ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9rem', marginRight: '8px' }}>
                          RD$ {minPrice.toLocaleString()}
                        </span>
                        <span style={{ color: primaryOffer.accentColor || 'var(--primary)' }}>
                          Desde RD$ {Math.round(minPrice * (1 - primaryOffer.discount / 100)).toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <>Desde RD$ {minPrice.toLocaleString()}</>
                    )}
                  </div>
                  <button className="btn">
                    <span className="material-icons">visibility</span>
                    Ver Disponibles
                  </button>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="section" id="nosotros">
        <div className="about-grid">
          <div className="about-text">
            <h2>{settings.aboutTitle}</h2>
            <p>{settings.aboutP1}</p>
            <p>{settings.aboutP2}</p>
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
            <p style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>location_on</span>
              {settings.contactAddress}
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>phone</span>
              {settings.contactPhone}
            </p>
          </div>
          <div className="social-links">
            <a href="#"><span className="material-icons">facebook</span></a>
            <a href="#"><span className="material-icons">camera_alt</span></a>
            <a href="#"><span className="material-icons">mail</span></a>
          </div>
        </div>
        <div className="copyright">
          <p>© 2026 {settings.storeName}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </>
  );
}
