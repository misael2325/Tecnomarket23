import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';

export default function ProductDetails() {
  const { id } = useParams();
  const { products, settings } = useInventory();
  
  const product = products.find(p => p.id === id);

  const rawPhone = (settings.contactPhone || '').replace(/\D/g, '');
  const waBase = `https://wa.me/${rawPhone}`;

  const WhatsAppIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.171.823-.298.044-.683.056-1.109-.079-.272-.087-.621-.219-1.07-.417-1.921-.853-3.141-2.859-3.236-2.987-.095-.128-.771-.979-.813-2.022-.043-1.043.518-1.579.742-1.815.143-.143.411-.226.619-.226.238 0 .375.006.536.006.161.006.375-.065.589.44.214.506.738 1.803.803 1.934.065.131.107.283.021.455-.078.156-.123.25-.245.393-.122.143-.257.319-.364.428-.12.122-.244.254-.105.494.139.24.617 1.018 1.328 1.649.914.811 1.684 1.06 1.924 1.18.24.12.381.101.524-.065.143-.166.613-.714.779-.958.165-.244.331-.205.556-.122.226.083 1.433.675 1.679.799.246.124.41.183.469.284.063.103.04.536-.104.941zm-3.413-12.416c-5.523 0-10 4.477-10 10 0 1.714.431 3.326 1.189 4.73l-1.201 4.387 4.534-1.191c1.393.738 2.975 1.164 4.654 1.164 5.522 0 10-4.477 10-10s-4.478-10-10-10zm0 18.25c-1.465 0-2.846-.388-4.043-1.066l-.29-.163-2.695.708.721-2.632-.18-.285c-.752-1.186-1.189-2.599-1.189-4.112 0-4.275 3.477-7.75 7.75-7.75 4.271 0 7.75 3.478 7.75 7.75 0 4.274-3.478 7.75-7.75 7.75z"/>
    </svg>
  );


  if (!product) {
    return (
      <div style={{ padding: '100px 5%', textAlign: 'center' }}>
        <h2 style={{color: 'white', marginBottom: '20px'}}>Página no encontrada</h2>
        <Link to="/" className="btn">Volver al Catálogo</Link>
      </div>
    );
  }

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
      </nav>

      <main style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--background)' }}>
        {/* EDITORIAL PRODUCT HERO */}
        <section className="section" style={{ paddingBottom: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1.2fr) 0.8fr', gap: '80px', alignItems: 'center' }}>
            
            {/* Spec-Overlay Image Container */}
            <div style={{ position: 'relative', borderRadius: 'var(--xl-radius)', overflow: 'hidden', background: 'var(--surface-container)', padding: '60px', display: 'flex', justifyContent: 'center' }}>
              <img src={product.image} alt={product.model} style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain', filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.5))' }} />
              
              {/* Overlay Spec Panel */}
              <div className="glass-effect" style={{ 
                position: 'absolute', 
                bottom: '40px', 
                right: '40px', 
                padding: '24px 32px', 
                borderRadius: 'var(--lg-radius)',
                border: '1px solid var(--outline-variant)',
                textAlign: 'left'
              }}>
                <span className="form-label" style={{ color: 'var(--primary)', marginBottom: '8px' }}>Categoría</span>
                <h4 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800 }}>{product.department}</h4>
              </div>
            </div>

            {/* Editorial Content */}
            <div>
              <span className="badge" style={{ background: 'var(--surface-container-highest)', color: 'var(--on-surface)' }}>{product.brand} Official</span>
              <h1 style={{ 
                fontFamily: 'var(--font-headline)', 
                fontSize: 'clamp(3rem, 5vw, 6rem)', 
                fontWeight: 800, 
                lineHeight: 0.9, 
                letterSpacing: '-4px', 
                marginBottom: '32px' 
              }}>
                {product.model}
              </h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--on-surface-variant)', lineHeight: 1.7, marginBottom: '48px' }}>
                {product.description}
              </p>
              
              <div style={{ background: 'var(--surface-container-low)', padding: '32px', borderRadius: 'var(--xl-radius)' }}>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Inventario Certificado</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>Disponibilidad inmediata con garantía Sailin.</p>
              </div>
            </div>
          </div>
        </section>

        {/* STOCK LIST - TONAL LAYERING */}
        <section className="section" style={{ paddingTop: '40px' }}>
          <div className="section-title">
            <h2 style={{ fontSize: '2.5rem' }}>Unidades Disponibles</h2>
          </div>

          <div className="device-list">
            {product.stock.length > 0 ? (
              product.stock.map(item => (
                <div key={item.id} className="device-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
                    <div>
                      <span className="form-label">Modelo</span>
                      <h4 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.4rem', fontWeight: 800 }}>{item.specificModel}</h4>
                    </div>
                    {product.department === 'Celulares' && (
                      <div>
                        <span className="form-label">Salud de Batería</span>
                        <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--tertiary)' }}>{item.battery}%</h4>
                      </div>
                    )}
                    <div>
                      <span className="form-label">Estado</span>
                      <div className={`device-grade grade-${item.grade.replace(/\s+/g, '-').toLowerCase()}`} 
                           style={{ background: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: 'none' }}>
                        {item.grade}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span className="form-label">Precio</span>
                      <h4 style={{ fontFamily: 'var(--font-headline)', fontSize: '2.2rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-1.5px' }}>
                        RD$ {item.price.toLocaleString()}
                      </h4>
                    </div>
                    <a
                      href={`${waBase}?text=${encodeURIComponent(`Hola, me interesa el ${item.specificModel} de la colección ${product.model} 📱`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{ padding: '16px 32px' }}
                    >
                      Solicitar Ahora
                      <span className="material-symbols-outlined">shopping_bag</span>
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '100px', textAlign: 'center', background: 'var(--surface-container-low)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--surface-container-highest)', marginBottom: '24px' }}>inventory</span>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem' }}>Próxima Disponibilidad</h3>
                <p style={{ color: 'var(--on-surface-variant)' }}>Suscríbete a nuestro Instagram para ver cuando lleguen nuevas unidades.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
