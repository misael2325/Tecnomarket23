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
      <nav>
        <Link to="/" className="nav-brand">
          <span className="material-icons">smartphone</span>
          {settings.storeName}
        </Link>
        <div className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/catalog" className="active">Catálogo</Link>
        </div>
      </nav>

      <section className="section" style={{ paddingTop: '120px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap', marginBottom: '50px' }}>
          <div style={{ flex: '1', minWidth: '300px', background: '#111', borderRadius: '20px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={product.image} alt={product.model} style={{ width: '100%', maxWidth: '500px', objectFit: 'contain' }} />
          </div>
          <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="badge" style={{alignSelf: 'flex-start'}}>{product.brand}</div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '20px', lineHeight: 1.1, background: 'linear-gradient(90deg, #fff, #8892b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{product.model}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '30px' }}>{product.description}</p>
            <h3 style={{ color: 'var(--primary)', fontSize: '2rem', marginBottom: '10px' }}>Inventario Físico Disponible</h3>
            <p style={{ color: 'var(--text-muted)' }}>Explora los teléfonos exactos que tenemos en la tienda hoy.</p>
          </div>
        </div>

        <div>
          {product.stock.length > 0 ? (
            <div className="device-list" style={{background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--glass-border)', overflow: 'hidden'}}>
              {product.stock.map(item => (
                <div key={item.id} className="device-item" style={{display: 'flex', padding: '25px', borderBottom: '1px solid var(--glass-border)', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px'}}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <span style={{color: 'white', fontWeight: 800, fontSize: '1.3rem'}}>{item.specificModel}</span>
                    <span className={`device-grade grade-${item.grade.toLowerCase()}`} style={{fontWeight: 700, padding: '4px 10px', borderRadius: '8px', border: '1px solid currentColor'}}>Grado {item.grade}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600, borderLeft: '1px solid var(--glass-border)', paddingLeft: '15px' }}>Batería {item.battery}%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                       <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Precio</span>
                       <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>RD$ {item.price.toLocaleString()}</span>
                    </div>
                    <a
                      href={`${waBase}?text=${encodeURIComponent(`Hola, me interesa el ${item.specificModel} (Grado ${item.grade}, Batería ${item.battery}%) en RD$ ${item.price.toLocaleString()} 📱`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ background: '#25D366', color: '#fff', borderRadius: '10px', padding: '12px 20px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' }}
                    >
                      <WhatsAppIcon />
                      Consultar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
              <span className="material-icons" style={{ fontSize: '4rem', color: 'var(--text-muted)', marginBottom: '15px' }}>sentiment_dissatisfied</span>
              <h3 style={{color: 'white', marginBottom: '10px', fontSize: '1.5rem'}}>Inventario Agotado</h3>
              <p style={{ color: 'var(--text-muted)' }}>Actualmente no hay unidades disponibles de esta marca o familia.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
