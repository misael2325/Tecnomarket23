import React from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';

export default function Home() {
  const { products, settings } = useInventory();

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
          </div>
        </div>
      </header>

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
                  <div className="card-price">Desde RD$ {minPrice.toLocaleString()}</div>
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
