import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';

export default function Catalog() {
  const { products = [], settings = {}, offers = [], loading } = useInventory();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const initialDept = queryParams.get('dept') || 'Todos';
  const offerId = queryParams.get('offer');
  
  const [selectedDept, setSelectedDept] = React.useState(initialDept);

  const activeDepts = React.useMemo(() => {
    const fromSettings = settings.departments || [];
    const fromProducts = Array.from(new Set(products.map(p => p.department || 'Celulares')));
    return Array.from(new Set([...fromSettings, ...fromProducts])).filter(dept => 
      products.some(p => (p.department || 'Celulares') === dept)
    );
  }, [products, settings.departments]);

  useEffect(() => {
    // Scroll to top when changing department inside component
    window.scrollTo(0, 0);
  }, [selectedDept]);

  const isOfferLive = (offer) => {
    if (!offer.active) return false;
    const today = new Date().toISOString().split('T')[0];
    return (!offer.startDate || today >= offer.startDate) && (!offer.endDate || today <= offer.endDate);
  };

  // Sync state with URL params if someone clicks a category link
  useEffect(() => {
    const qDept = new URLSearchParams(location.search).get('dept') || 'Todos';
    if (qDept !== selectedDept) {
      setSelectedDept(qDept);
    }
  }, [location.search, selectedDept]);

  const targetOffer = offerId ? offers.find(o => o.id === offerId && isOfferLive(o)) : null;

  const handleSelectDept = (dept) => {
    setSelectedDept(dept);
    navigate(dept === 'Todos' ? '/catalog' : `/catalog?dept=${encodeURIComponent(dept)}`);
  };

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
          onClick={() => handleSelectDept('Todos')}
          className={selectedDept === 'Todos' ? 'btn' : 'btn btn-outline'}
          style={{ padding: '8px 20px', fontSize: '0.8rem', whiteSpace: 'nowrap', borderRadius: '100px' }}
        >
          ✨ Todos
        </button>
        {activeDepts.map(dept => (
          <button 
            key={dept} 
            onClick={() => handleSelectDept(dept)}
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

        {/* Banner de Colección Filtrada */}
        {targetOffer && (
          <div style={{ background: targetOffer.bgColor || 'var(--surface-container-low)', padding: '24px', borderRadius: 'var(--xl-radius)', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', border: `1px solid ${targetOffer.accentColor || 'var(--primary)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>{targetOffer.emoji}</span>
              <div>
                <h2 style={{ fontFamily: 'var(--font-headline)', color: 'white', fontSize: '1.5rem', marginBottom: '4px' }}>Colección: {targetOffer.name}</h2>
                <p style={{ color: 'var(--on-surface-variant)', margin: 0 }}>Estás viendo exclusivamente los equipos con este descuento especial.</p>
              </div>
            </div>
            <Link to="/catalog" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)' }}>
              <span className="material-symbols-outlined">close</span> Quitar filtro
            </Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '60px', maxWidth: '1400px', margin: '0 auto' }}>
          {activeDepts
            .filter(d => selectedDept === 'Todos' || d === selectedDept)
            .map(dept => {
              let deptProducts = products.filter(p => (p.department || 'Celulares') === dept);
              
              if (targetOffer) {
                deptProducts = deptProducts.filter(p => (targetOffer.applicableProducts || []).includes(p.id));
              }

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

                      const activeOffer = offers.find(o => isOfferLive(o) && (o.applicableProducts || []).includes(product.id));
                      const discountedPrice = activeOffer ? minPrice - (minPrice * (activeOffer.discount / 100)) : minPrice;

                      return (
                        <Link to={`/device/${product.id}`} key={product.id} className="card">
                          <div className="card-img-wrapper">
                            <img src={product.image} alt={product.model} loading="lazy" />
                            {stockItems.length === 0 && (
                              <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem' }}>Agotado</div>
                            )}
                            {activeOffer && stockItems.length > 0 && (
                              <div style={{ position: 'absolute', top: '10px', left: '10px', background: activeOffer.accentColor || 'var(--primary)', color: 'black', padding: '4px 10px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                                <span>{activeOffer.emoji}</span> {activeOffer.name}
                              </div>
                            )}
                          </div>
                          <div className="card-info">
                            <h3 className="card-title">{product.model}</h3>
                            <div className="card-price" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              {stockItems.length > 0 ? (
                                activeOffer ? (
                                  <>
                                    <span style={{ textDecoration: 'line-through', color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>
                                      RD$ {minPrice.toLocaleString('en-US')}
                                    </span>
                                    <span style={{ color: activeOffer.accentColor || 'var(--primary)', fontWeight: 900, fontSize: '1.2rem' }}>
                                      RD$ {discountedPrice.toLocaleString('en-US')}
                                    </span>
                                    <span style={{ background: activeOffer.accentColor || 'var(--primary)', color: 'black', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                                      -{activeOffer.discount}%
                                    </span>
                                  </>
                                ) : (
                                  `RD$ ${minPrice.toLocaleString('en-US')}`
                                )
                              ) : 'Próximamente'}
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
