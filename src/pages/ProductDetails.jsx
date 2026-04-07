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
          <div className="section-title" style={{ textAlign: 'left', marginBottom: '32px' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>Unidades en Stock</h2>
          </div>

          <div className="device-list">
            {product.stock && product.stock.length > 0 ? (
              product.stock.map(item => (
                <div key={item.id} className="device-item">
                  <div className="item-main-info">
                    <div className="item-model-group">
                      <span className="form-label">Modelo</span>
                      <h4>{item.specificModel}</h4>
                    </div>
                    {product.department === 'Celulares' && (
                      <div className="item-extra-info">
                        <span className="form-label">Batería</span>
                        <h4 style={{ color: 'var(--primary)' }}>{item.battery}%</h4>
                      </div>
                    )}
                    <div className="item-extra-info">
                      <span className="form-label">Estado</span>
                      <div className={`device-grade`}>
                        {item.grade}
                      </div>
                    </div>
                  </div>

                  <div className="item-action-info">
                    <div className="price-group">
                      <span className="form-label">Precio</span>
                      <h4 className="price-text">
                        RD$ {Number(item.price).toLocaleString()}
                      </h4>
                    </div>
                    <a
                      href={`${waBase}?text=${encodeURIComponent(`Hola, me interesa el ${item.specificModel} de la colección ${product.model} 📱`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
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
