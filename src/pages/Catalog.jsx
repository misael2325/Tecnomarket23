import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';

export default function Catalog() {
  const { products = [], settings = {}, loading } = useInventory();
  const { logout } = useAuth();
  const [selectedDept, setSelectedDept] = React.useState('Todos');

  const activeDepts = React.useMemo(() => {
    const fromSettings = settings.departments || [];
    const fromProducts = Array.from(new Set(products.map(p => p.department || 'Celulares')));
    return Array.from(new Set([...fromSettings, ...fromProducts])).filter(dept => 
      products.some(p => (p.department || 'Celulares') === dept)
    );
  }, [products, settings.departments]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedDept]);

  const rawPhone = (settings.contactPhone || '').replace(/\D/g, '');
  const waLink = `https://wa.me/${rawPhone}?text=${encodeURIComponent('Hola, me interesa uno de sus equipos disponibles 📱')}`;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader"></div>
        <p style={{ color: 'var(--primary)', marginLeft: '15px' }}>Cargando catálogo...</p>
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
          <Link to="/catalog" className="active">Catálogo</Link>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button onClick={() => logout()} className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
            Salir
          </button>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '10px 24px' }}>
            Chat Directo
          </a>
        </div>
      </nav>

      {/* FILTER BAR - CLASSIC STICKY */}
      <div className="glass-effect" style={{ 
        position: 'sticky', 
        top: '70px', 
        zIndex: 100, 
        padding: '16px 8%',
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        justifyContent: 'center',
        borderBottom: '1px solid var(--outline-variant)'
      }}>
        <button 
          onClick={() => setSelectedDept('Todos')}
          className={selectedDept === 'Todos' ? 'btn' : 'btn btn-outline'}
          style={{ padding: '8px 20px', fontSize: '0.8rem', whiteSpace: 'nowrap', borderRadius: '100px' }}
        >
          ✨ Todos
        </button>
        {activeDepts.map(dept => (
          <button 
            key={dept} 
            onClick={() => setSelectedDept(dept)}
            className={selectedDept === dept ? 'btn' : 'btn btn-outline'}
            style={{ padding: '8px 20px', fontSize: '0.8rem', whiteSpace: 'nowrap', borderRadius: '100px' }}
          >
            {dept}
          </button>
        ))}
      </div>

      <section className="section" style={{ minHeight: '80vh' }}>
        <div className="section-title">
          <span className="badge">Inventario Disponible</span>
          <h2>Nuestra Coleccion</h2>
          <p>Equipos certificados con garantía real. Selecciona tu unidad para ver detalles específicos.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '60px', maxWidth: '1400px', margin: '0 auto' }}>
          {activeDepts
            .filter(d => selectedDept === 'Todos' || d === selectedDept)
            .map(dept => {
              const deptProducts = products.filter(p => (p.department || 'Celulares') === dept);
              if (deptProducts.length === 0) return null;

              return (
                <div key={dept}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{dept}</h3>
                    <div style={{ height: '1px', flex: 1, background: 'var(--outline-variant)' }}></div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{deptProducts.length} Equipos</span>
                  </div>
                  
                  <div className="productos">
                    {deptProducts.map(product => {
                      const stockItems = product.stock || [];
                      const minPrice = stockItems.length > 0
                        ? Math.min(...stockItems.map(s => Number(s.price) || 0))
                        : (Number(product.basePrice) || 0);

                      return (
                        <Link to={`/device/${product.id}`} key={product.id} className="card">
                          <div className="card-img-wrapper">
                            <img src={product.image} alt={product.model} loading="lazy" />
                            {stockItems.length === 0 && (
                              <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem' }}>Agotado</div>
                            )}
                          </div>
                          <div className="card-info">
                            <h3 className="card-title">{product.model}</h3>
                            <div className="card-price">
                              {stockItems.length > 0 ? `RD$ ${minPrice.toLocaleString()}` : 'Próximamente'}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                              <span>Ver detalles</span>
                              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>arrow_forward</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
          })}
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <div>
            <h2 className="nav-brand" style={{ fontSize: '2rem', marginBottom: '20px' }}>{settings.storeName}</h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '1rem' }}>{settings.footerDesc}</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Soporte</h4>
            <p style={{ fontSize: '0.9rem' }}>{settings.contactAddress}</p>
            <p style={{ marginTop: '10px', fontWeight: 800, color: 'var(--primary)' }}>{settings.contactPhone}</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Conecta</h4>
            <div className="social-links">
              {settings.socialFacebook && (
                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer"><span className="material-symbols-outlined">facebook</span></a>
              )}
              {settings.socialInstagram && (
                <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer"><span className="material-symbols-outlined">camera_alt</span></a>
              )}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
