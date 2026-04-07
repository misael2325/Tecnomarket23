import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';


export default function Catalog() {
  const { products = [], settings = {}, loading } = useInventory();
  const { logout } = useAuth();
  const [selectedDept, setSelectedDept] = React.useState('Todos');

  // Dynamic Departments
  const activeDepts = React.useMemo(() => {
    const fromSettings = settings.departments || [];
    const fromProducts = Array.from(new Set(products.map(p => p.department || 'Celulares')));
    
    // Combine and ensure only those with products are shown (unless it's in settings but empty, maybe?)
    // Actually, for user experience, let's show all mentioned in either, but filter to those with products mostly.
    const combined = Array.from(new Set([...fromSettings, ...fromProducts]));
    
    // Sort them (optional) or keep settings order first
    return combined.filter(dept => products.some(p => (p.department || 'Celulares') === dept));
  }, [products, settings.departments]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedDept]);

  // WhatsApp link from settings phone
  const rawPhone = (settings.contactPhone || '').replace(/\D/g, '');
  const waLink = `https://wa.me/${rawPhone}?text=${encodeURIComponent('Hola, me interesa uno de sus equipos disponibles 📱')}`;

  const WhatsAppIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.171.823-.298.044-.683.056-1.109-.079-.272-.087-.621-.219-1.07-.417-1.921-.853-3.141-2.859-3.236-2.987-.095-.128-.771-.979-.813-2.022-.043-1.043.518-1.579.742-1.815.143-.143.411-.226.619-.226.238 0 .375.006.536.006.161.006.375-.065.589.44.214.506.738 1.803.803 1.934.065.131.107.283.021.455-.078.156-.123.25-.245.393-.122.143-.257.319-.364.428-.12.122-.244.254-.105.494.139.24.617 1.018 1.328 1.649.914.811 1.684 1.06 1.924 1.18.24.12.381.101.524-.065.143-.166.613-.714.779-.958.165-.244.331-.205.556-.122.226.083 1.433.675 1.679.799.246.124.41.183.469.284.063.103.04.536-.104.941zm-3.413-12.416c-5.523 0-10 4.477-10 10 0 1.714.431 3.326 1.189 4.73l-1.201 4.387 4.534-1.191c1.393.738 2.975 1.164 4.654 1.164 5.522 0 10-4.477 10-10s-4.478-10-10-10zm0 18.25c-1.465 0-2.846-.388-4.043-1.066l-.29-.163-2.695.708.721-2.632-.18-.285c-.752-1.186-1.189-2.599-1.189-4.112 0-4.275 3.477-7.75 7.75-7.75 4.271 0 7.75 3.478 7.75 7.75 0 4.274-3.478 7.75-7.75 7.75z"/>
    </svg>
  );

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader"></div>
        <p style={{ color: 'var(--primary)', marginLeft: '15px', fontWeight: 'bold' }}>Cargando catálogo...</p>
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
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '10px 24px', background: 'var(--primary)', color: 'var(--on-primary)' }}>
            Chat Directo
          </a>
        </div>
      </nav>

      {/* STICKY FILTER BAR */}
      <div className="glass-effect" style={{ 
        position: 'sticky', 
        top: '72px', 
        zIndex: 100, 
        padding: '24px 8%',
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        justifyContent: 'center'
      }}>
        <button 
          onClick={() => setSelectedDept('Todos')}
          style={{ 
            whiteSpace: 'nowrap', 
            padding: '12px 28px', 
            fontSize: '0.9rem',
            fontFamily: 'var(--font-headline)',
            fontWeight: 700,
            background: selectedDept === 'Todos' ? 'var(--primary)' : 'var(--surface-container-high)',
            color: selectedDept === 'Todos' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
            border: 'none',
            borderRadius: '100px',
            transition: 'var(--transition)',
            cursor: 'pointer'
          }}
        >
          {selectedDept === 'Todos' && '✨'} Todos
        </button>
        {activeDepts.map(dept => {
          const isActive = selectedDept === dept;
          return (
            <button 
              key={dept} 
              onClick={() => setSelectedDept(dept)}
              style={{ 
                whiteSpace: 'nowrap', 
                padding: '12px 28px', 
                fontSize: '0.9rem',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                background: isActive ? 'var(--primary)' : 'var(--surface-container-high)',
                color: isActive ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                border: 'none',
                borderRadius: '100px',
                transition: 'var(--transition)',
                cursor: 'pointer'
              }}
            >
              {isActive && '📍'} {dept}
            </button>
          );
        })}
      </div>

      <section className="section" style={{ minHeight: '80vh' }}>
        <div className="section-title">
          <span className="badge">Catálogo Certificado</span>
          <h2>Selección Curada</h2>
          <p>Dispositivos de alto rendimiento, verificados y listos para definir tu experiencia digital.</p>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '120px 24px', background: 'var(--surface-container-low)', borderRadius: 'var(--xl-radius)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '5rem', color: 'var(--surface-container-highest)', marginBottom: '24px' }}>inventory_2</span>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', marginBottom: '12px' }}>Sin artículos disponibles</h3>
            <p style={{ color: 'var(--on-surface-variant)' }}>Estamos preparando nuevas unidades para ti.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', maxWidth: '1600px', margin: '0 auto' }}>
            {activeDepts
              .filter(d => selectedDept === 'Todos' || d === selectedDept)
              .map(dept => {
                const deptProducts = products.filter(p => (p.department || 'Celulares') === dept);
                if (deptProducts.length === 0) return null;

                return (
                  <div key={dept} style={{ animation: 'fadeUp 0.8s ease backwards' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
                      <div style={{ 
                        background: 'var(--primary)', 
                        padding: '12px 32px', 
                        borderRadius: '0 100px 100px 0', 
                        marginLeft: '-8%',
                        boxShadow: '20px 0 60px rgba(179, 197, 255, 0.2)'
                      }}>
                        <h3 style={{ 
                          fontFamily: 'var(--font-headline)',
                          fontSize: '1.8rem', 
                          fontWeight: 900,
                          letterSpacing: '-1px',
                          margin: 0,
                          color: 'var(--on-primary)'
                        }}>
                          {dept}
                        </h3>
                      </div>
                      <div style={{ height: '1px', flex: 1, background: 'var(--outline-variant)' }}></div>
                      <span className="stock-badge">{deptProducts.length} Dispositivos</span>
                    </div>
                    
                    <div className="productos-container">
                      <div className="productos">
                        {deptProducts.map(product => {
                          const stockItems = product.stock || [];
                          const minPrice = stockItems.length > 0
                            ? Math.min(...stockItems.map(s => Number(s.price) || 0))
                            : (Number(product.basePrice) || 0);

                          return (
                            <Link to={`/device/${product.id}`} key={product.id} className="card">
                              <div className="card-img-wrapper">
                                <img src={product.image} alt={product.model} />
                              </div>
                              <div className="card-info">
                                <h3 className="card-title">{product.model}</h3>
                                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
                                  {product.description}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                  <div className="card-price">
                                    {stockItems.length > 0 ? `RD$ ${minPrice.toLocaleString()}` : 'Agotado'}
                                  </div>
                                  <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontWeight: 900 }}>arrow_forward</span>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
            })}
          </div>
        )}
      </section>

      {/* FOOTER - MATCH HOME */}
      <footer>
        <div className="footer-content">
          <div>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-2px', background: 'linear-gradient(to right, var(--primary), var(--primary-container))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {settings.storeName}
            </h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem', maxWidth: '400px' }}>
              {settings.footerDesc}
            </p>
          </div>
          <div>
            <h4 className="form-label" style={{ marginBottom: '24px' }}>Ubicación</h4>
            <p style={{ fontSize: '0.95rem', marginBottom: '16px' }}>{settings.contactAddress}</p>
            <p style={{ color: 'var(--primary)', fontWeight: 700 }}>{settings.contactPhone}</p>
          </div>
          <div>
            <h4 className="form-label" style={{ marginBottom: '24px' }}>Redes Sociales</h4>
            <div className="social-links" style={{ gap: '16px' }}>
              {settings.socialFacebook && (
                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer">
                  <span className="material-symbols-outlined">facebook</span>
                </a>
              )}
              {settings.socialInstagram && (
                <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer">
                  <span className="material-symbols-outlined">camera_alt</span>
                </a>
              )}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '40px', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>
          © 2026 {settings.storeName}. High-End Editorial Tech.
        </div>
      </footer>
    </>
  );
}
