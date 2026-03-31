import React from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';

export default function Catalog() {
  const { products, settings } = useInventory();

  // WhatsApp link from settings phone
  const rawPhone = (settings.contactPhone || '').replace(/\D/g, '');
  const waLink = `https://wa.me/${rawPhone}?text=${encodeURIComponent('Hola, me interesa uno de sus equipos disponibles 📱')}`;

  return (
    <>
      <nav>
        <Link to="/" className="nav-brand">
          <span className="material-icons">smartphone</span>
          {settings.storeName}
        </Link>
        <div className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/catalog" className="active">Catálogo</Link>
          <a href="#contacto">Contacto</a>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '8px 20px', background: '#25D366', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem' }}>💬</span> WhatsApp
          </a>
        </div>
      </nav>

      <section className="section" style={{ paddingTop: '120px', minHeight: '100vh' }}>
        <div className="section-title">
          <h2>Explora por Marca</h2>
          <p>Selecciona una categoría para ver todos los modelos específicos y su disponibilidad hoy.</p>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <span className="material-icons" style={{ fontSize: '4rem', display: 'block', marginBottom: '15px' }}>inventory_2</span>
            <h3 style={{ color: 'white', marginBottom: '10px' }}>Catálogo en preparación</h3>
            <p>Vuelve pronto para ver nuestras marcas disponibles.</p>
          </div>
        ) : (
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <h3 className="card-title" style={{ margin: 0 }}>{product.model}</h3>
                      {product.stock.length > 0 && (
                        <span className="stock-badge" style={{ marginLeft: 0 }}>{product.stock.length} unds</span>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px', flex: 1 }}>
                      {product.description}
                    </p>
                    <div className="card-price" style={{ marginBottom: '15px' }}>
                      {product.stock.length > 0 ? `Desde RD$ ${minPrice.toLocaleString()}` : 'Próximamente'}
                    </div>
                    <button className="btn">
                      <span className="material-icons">visibility</span>
                      Ver Disponibles
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <footer id="contacto">
        <div className="footer-content">
          <div style={{ textAlign: 'left' }}>
            <div className="nav-brand" style={{ marginBottom: '10px' }}>
              <span className="material-icons">smartphone</span>
              {settings.storeName}
            </div>
            <p style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>{settings.footerDesc}</p>
          </div>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ color: 'white', marginBottom: '15px', fontSize: '1.1rem' }}>Contacto Directo</h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>location_on</span>
              {settings.contactAddress}
            </p>
            <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>phone</span>
              {settings.contactPhone}
            </a>
          </div>
          <div className="social-links">
            <a href="#"><span className="material-icons">facebook</span></a>
            <a href="#"><span className="material-icons">camera_alt</span></a>
            <a href={waLink} target="_blank" rel="noopener noreferrer"><span className="material-icons">chat</span></a>
          </div>
        </div>
        <div className="copyright">
          <p>© 2026 {settings.storeName}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </>
  );
}
