import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  'Celulares',
  'Laptops & Computadoras',
  'Tablets',
  'Smartwatches',
  'TV & Entretenimiento',
  'Accesorios'
];

export default function Catalog() {
  const { products = [], settings = {}, loading } = useInventory();
  const { logout } = useAuth();
  const [selectedDept, setSelectedDept] = React.useState('Todos');

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
      <nav>
        <Link to="/" className="nav-brand">
          <span className="material-icons" style={{ color: 'var(--primary)' }}>smartphone</span>
          {settings.storeName}
        </Link>
        <div className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/catalog" className="active">Catálogo</Link>
          <a href="#contacto">Contacto</a>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button onClick={() => logout()} className="btn btn-outline" style={{ padding: '6px 15px', fontSize: '0.85rem' }}>
            Cerrar Sesión
          </button>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '8px 20px', background: '#25D366', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WhatsAppIcon />
            Chat
          </a>
        </div>
      </nav>

      <div style={{ 
        position: 'sticky', 
        top: '70px', 
        zIndex: 100, 
        background: 'rgba(10, 10, 12, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '15px 5%',
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        <button 
          onClick={() => setSelectedDept('Todos')}
          style={{ 
            whiteSpace: 'nowrap', 
            color: selectedDept === 'Todos' ? '#000' : 'white', 
            border: 'none',
            padding: '8px 20px', 
            borderRadius: '25px', 
            background: selectedDept === 'Todos' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: selectedDept === 'Todos' ? '0 0 15px var(--primary-glow)' : 'none'
          }}
        >
          Todos
        </button>
        {DEPARTMENTS.map(dept => {
          const hasProducts = products.some(p => (p.department || 'Celulares') === dept);
          if (!hasProducts) return null;
          const isActive = selectedDept === dept;
          return (
            <button 
              key={dept} 
              onClick={() => setSelectedDept(dept)}
              style={{ 
                whiteSpace: 'nowrap', 
                color: isActive ? '#000' : 'white', 
                border: 'none',
                padding: '8px 20px', 
                borderRadius: '25px', 
                background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? '0 0 15px var(--primary-glow)' : 'none'
              }}
            >
              {dept}
            </button>
          );
        })}
      </div>

      <section className="section" style={{ paddingTop: '50px', minHeight: '80vh' }}>
        <div className="section-title">
          <h2>Catálogo Completo</h2>
          <p>Explora nuestras secciones exclusivas y encuentra el equipo ideal para ti.</p>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <span className="material-icons" style={{ fontSize: '4rem', display: 'block', marginBottom: '15px' }}>inventory_2</span>
            <h3 style={{ color: 'white', marginBottom: '10px' }}>Catálogo vacío</h3>
            <p>Vuelve pronto para ver nuestras categorías disponibles.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '50px', maxWidth: '1200px', margin: '0 auto' }}>
            {DEPARTMENTS
              .filter(d => selectedDept === 'Todos' || d === selectedDept)
              .map(dept => {
                const deptProducts = products.filter(p => (p.department || 'Celulares') === dept);
                if (deptProducts.length === 0) return null;

                return (
                  <div key={dept} style={{ animation: 'fadeIn 0.5s ease' }}>
                    <h3 style={{ 
                      color: 'white', 
                      fontSize: '1.6rem', 
                      marginBottom: '20px', 
                      paddingLeft: '5%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '1.8rem' }}>
                        {dept === 'Celulares' ? 'smartphone' : 
                         dept === 'Laptops & Computadoras' ? 'laptop' :
                         dept === 'Tablets' ? 'tablet' :
                         dept === 'Smartwatches' ? 'watch' :
                         dept === 'TV & Entretenimiento' ? 'tv' : 'settings_input_component'}
                      </span>
                      {dept}
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({deptProducts.length})</span>
                    </h3>
                    
                    <div className="productos" style={{ padding: '0 5%' }}>
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
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <h3 className="card-title" style={{ margin: 0 }}>{product.model}</h3>
                                {stockItems.length > 0 && (
                                  <span className="stock-badge" style={{ marginLeft: 0 }}>{stockItems.length} uds</span>
                                )}
                              </div>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {product.description}
                              </p>
                              <div className="card-price" style={{ marginBottom: '15px' }}>
                                {stockItems.length > 0 ? `Desde RD$ ${minPrice.toLocaleString()}` : 'Próximamente'}
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
                  </div>
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
            <a 
              href={settings.locationLat && settings.locationLng 
                ? `https://www.google.com/maps?q=${settings.locationLat},${settings.locationLng}`
                : `https://www.google.com/maps/search/${encodeURIComponent(settings.contactAddress || '')}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
              className="hover-primary"
            >
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>location_on</span>
              {settings.contactAddress}
            </a>
            <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>phone</span>
              {settings.contactPhone}
            </a>
            {settings.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <span className="material-icons" style={{ fontSize: '1.2rem' }}>mail</span>
                {settings.contactEmail}
              </a>
            )}
          </div>
          <div className="social-links">
            {settings.socialFacebook && <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer"><span className="material-icons">facebook</span></a>}
            {settings.socialInstagram && <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer"><span className="material-icons">camera_alt</span></a>}
            {settings.contactEmail && <a href={`mailto:${settings.contactEmail}`}><span className="material-icons">mail</span></a>}
          </div>
        </div>
        <div className="copyright">
          <p>© 2026 {settings.storeName}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </>
  );
}
