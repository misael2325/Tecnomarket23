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
                      href={`${waBase}?text=${encodeURIComponent(`Hola, me interesa el ${item.specificModel} de la colección ${product.model} 📱`)}`}
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
      </main>
    </>
  );
}
