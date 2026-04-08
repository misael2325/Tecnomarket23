import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';

export default function ProductDetails() {
  const { id } = useParams();
  const { products, settings, loading } = useInventory();
  
  const product = products.find(p => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>Cargando detalles...</div>;
  }

  if (!product) {
    return (
      <div style={{ padding: '100px 5%', textAlign: 'center', minHeight: '100vh', background: 'var(--background)' }}>
        <h2 style={{color: 'white', marginBottom: '200px'}}>Página no encontrada</h2>
        <Link to="/" className="btn">Volver al Catálogo</Link>
      </div>
    );
  }

  const rawPhone = (settings.contactPhone || '').replace(/\D/g, '');
  const waBase = `https://wa.me/${rawPhone}`;

  return (
    <>
      <nav className="glass-effect">
        <Link to="/" className="nav-brand">
          {settings.storeName || 'Sailin Tecno'}
        </Link>
        <div className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/catalog">Catálogo</Link>
        </div>
        <Link to="/catalog" className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
          Volver
        </Link>
      </nav>

      <main className="details-page">
        <section className="section">
          <div className="details-grid">
            {/* PRODUCT IMAGE CONTAINER */}
            <div className="details-image-card">
              <img src={product.image} alt={product.model} />
              <div className="category-tag">
                <span>Categoría</span>
                <h4>{product.department}</h4>
              </div>
            </div>

            {/* PRODUCT INFO */}
            <div className="details-content">
              <span className="badge">{product.brand} Official</span>
              <h1>{product.model}</h1>
              <p className="description-text">
                {product.description || 'Sin descripción disponible para este modelo.'}
              </p>
              
              <div className="status-banner">
                <h3>Colección Certificada</h3>
                <p>Verifica las unidades físicas disponibles debajo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* STOCK LIST */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 800 }}>Unidades en Stock</h2>
            <span style={{ background: 'var(--primary)', color: 'var(--on-primary)', padding: '2px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 700 }}>
              {product.stock?.length || 0}
            </span>
          </div>

          <div className="stock-table">
            {/* HEADER ROW */}
            <div className="stock-header-row">
              <span>Modelo</span>
              {product.department === 'Celulares' && <span>Batería</span>}
              <span>Estado</span>
              <span>Precio</span>
              <span></span>
            </div>

            {product.stock && product.stock.length > 0 ? (
              product.stock.map((item, index) => (
                <div key={item.id} className={`stock-row ${index % 2 === 0 ? 'stock-row-even' : 'stock-row-odd'}`}>
                  <div className="stock-cell stock-model">
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--on-surface-variant)' }}>smartphone</span>
                    <strong>{item.specificModel}</strong>
                  </div>

                  {product.department === 'Celulares' && (
                    <div className="stock-cell">
                      <span className="battery-pill">
                        🔋 {item.battery}%
                      </span>
                    </div>
                  )}

                  <div className="stock-cell">
                    <span className="grade-pill">{item.grade}</span>
                  </div>

                  <div className="stock-cell stock-price">
                    RD$ {Number(item.price).toLocaleString()}
                  </div>

                  <div className="stock-cell stock-action">
                    <a
                      href={(() => {
                        const batteryLine = product.department === 'Celulares'
                          ? `\n🔋 *Salud de Batería:* ${item.battery}%` : '';
                        const msg =
`👋 ¡Hola! Estoy interesado/a en el siguiente equipo:

━━━━━━━━━━━━━━━━━━━━
📱 *Familia:* ${product.model}
📦 *Modelo Exacto:* ${item.specificModel}
⭐ *Estado:* ${item.grade}${batteryLine}
💰 *Precio:* RD$ ${Number(item.price).toLocaleString()}
━━━━━━━━━━━━━━━━━━━━

¿Este equipo sigue disponible? 😊`;
                        return `${waBase}?text=${encodeURIComponent(msg)}`;
                      })()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{ padding: '10px 24px', whiteSpace: 'nowrap' }}
                    >
                      Lo quiero
                      <span className="material-symbols-outlined">shopping_bag</span>
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-stock">
                <span className="material-symbols-outlined" style={{ fontSize: '3rem', opacity: 0.3 }}>inventory_2</span>
                <p>No hay unidades disponibles en este momento.</p>
              </div>
            )}
          </div>
        </section>

        {/* EXTRA INFO: GRADES, QUICK LINKS, CONTACT */}
        <section className="section" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '40px', paddingBottom: '60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px' }}>
            
            {/* Grades Info */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>info</span>
                Condiciones de Equipos
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px', fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>
                <li><strong style={{ color: 'var(--on-surface)' }}>Nuevo:</strong> Equipo nuevo en caja.</li>
                <li><strong style={{ color: 'var(--on-surface)' }}>Como Nuevo:</strong> Equipo en perfecto estado físico.</li>
                <li><strong style={{ color: 'var(--on-surface)' }}>Grado A:</strong> Muy buen estado físico, leves señales de uso, 100% funcional.</li>
                <li><strong style={{ color: 'var(--on-surface)' }}>Grado A-:</strong> Buen estado, detalles estéticos moderados, 100% funcional.</li>
                <li><strong style={{ color: 'var(--on-surface)' }}>Outlet:</strong> Funcional con rebaja por liquidación (Reparado).</li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: '20px' }}>Accesos Rápidos</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Link to="/catalog" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.95rem' }}>SIM Card</Link>
                <Link to="/catalog" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.95rem' }}>Teléfonos móviles</Link>
                <Link to="/catalog" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.95rem' }}>Seguros iPhone</Link>
                <Link to="/catalog" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.95rem' }}>Accesorios</Link>
                <Link to="/catalog" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.95rem' }}>Venta relojes</Link>
                <Link to="/catalog" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.95rem' }}>Ofertas Destacadas</Link>
              </div>
            </div>

            {/* Contact & Share */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: '20px' }}>Contáctanos</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', marginBottom: '20px', lineHeight: 1.5 }}>
                Te atendemos por WhatsApp y puedes hacer tu pedido aquí mismo.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href={waBase} target="_blank" rel="noopener noreferrer" className="btn" style={{ justifyContent: 'center' }}>
                  <span className="material-symbols-outlined">forum</span>
                  WhatsApp
                </a>
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: product.model, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Enlace copiado al portapapeles');
                    }
                  }}
                  className="btn btn-outline" style={{ justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>share</span>
                  Comparte esta página
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
