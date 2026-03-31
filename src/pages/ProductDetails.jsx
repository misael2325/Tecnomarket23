import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';

export default function ProductDetails() {
  const { id } = useParams();
  const { products, settings } = useInventory();
  
  const product = products.find(p => p.id === id);

  const rawPhone = (settings.contactPhone || '').replace(/\D/g, '');
  const waBase = `https://wa.me/${rawPhone}`;


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
                      style={{ background: '#25D366', color: '#fff', borderRadius: '10px', padding: '12px 20px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                    >
                      💬 Consultar
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
