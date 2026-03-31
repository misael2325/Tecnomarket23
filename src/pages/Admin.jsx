import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';

const OFFER_TEMPLATES = [
  { name: 'Black Friday', emoji: '🖤', discount: 30, color: '#111111', accentColor: '#f59e0b' },
  { name: 'Navidad', emoji: '🎄', discount: 20, color: '#065f46', accentColor: '#f87171' },
  { name: 'Día del Amor', emoji: '❤️', discount: 15, color: '#881337', accentColor: '#fda4af' },
  { name: 'Día de las Madres', emoji: '🌸', discount: 15, color: '#701a75', accentColor: '#f0abfc' },
  { name: 'Año Nuevo', emoji: '🎆', discount: 25, color: '#1e1b4b', accentColor: '#818cf8' },
  { name: 'Aniversario', emoji: '🥳', discount: 10, color: '#1c1917', accentColor: '#00f0ff' },
];

const emptyOffer = {
  name: '',
  emoji: '🎉',
  discount: '',
  startDate: '',
  endDate: '',
  description: '',
  bgColor: '#0f172a',
  accentColor: '#00f0ff',
  active: true,
};

export default function Admin() {
  const { 
    products, updateProduct, addNewModel, deleteModel, 
    settings, updateSettings,
    offers, addOffer, updateOffer, deleteOffer
  } = useInventory();
  
  const [activeTab, setActiveTab] = useState('models');

  // --- Stock Tab State ---
  const [selectedProduct, setSelectedProduct] = useState('');
  const [showStockModal, setShowStockModal] = useState(false);
  const [newStock, setNewStock] = useState({ specificModel: '', grade: 'A', battery: 100, price: '' });

  // --- Settings Tab State ---
  const [localSettings, setLocalSettings] = useState(settings);
  const [showModelModal, setShowModelModal] = useState(false);
  const [newModel, setNewModel] = useState({ brand: '', model: '', image: '', description: '', basePrice: '' });

  // --- Offers Tab State ---
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [newOffer, setNewOffer] = useState(emptyOffer);

  // Sync localSettings when global settings load from Firebase
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // ------  SETTINGS HANDLERS ------
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings(localSettings);
    alert('✅ Configuración guardada exitosamente.');
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: value }));
  };

  // Why Us Editor
  const handleWhyUsChange = (index, field, value) => {
    const updated = [...(localSettings.whyUsItems || [])];
    updated[index] = { ...updated[index], [field]: value };
    setLocalSettings(prev => ({ ...prev, whyUsItems: updated }));
  };

  const handleAddWhyUs = () => {
    const newItem = { id: Date.now().toString(), icon: '⭐', title: '', desc: '' };
    setLocalSettings(prev => ({ ...prev, whyUsItems: [...(prev.whyUsItems || []), newItem] }));
  };

  const handleDeleteWhyUs = (index) => {
    const updated = [...(localSettings.whyUsItems || [])];
    updated.splice(index, 1);
    setLocalSettings(prev => ({ ...prev, whyUsItems: updated }));
  };

  // ------ MODELS HANDLERS ------
  const handleAddModel = (e) => {
    e.preventDefault();
    const modelObj = {
      id: newModel.brand.toLowerCase() + '-' + Date.now(),
      brand: newModel.brand,
      model: newModel.model,
      image: newModel.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
      description: newModel.description,
      basePrice: Number(newModel.basePrice),
      stock: []
    };
    addNewModel(modelObj);
    setShowModelModal(false);
    setNewModel({ brand: '', model: '', image: '', description: '', basePrice: '' });
  };

  // ------ STOCK HANDLERS ------
  const handleAddStock = (e) => {
    e.preventDefault();
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const newItem = {
      id: Date.now().toString(),
      specificModel: newStock.specificModel,
      grade: newStock.grade,
      battery: Number(newStock.battery),
      price: Number(newStock.price) || product.basePrice
    };

    const updated = { ...product, stock: [...product.stock, newItem] };
    updateProduct(updated);
    setShowStockModal(false);
    setNewStock({ specificModel: '', grade: 'A', battery: 100, price: '' });
  };

  const handleDeleteStock = (productId, stockId) => {
    const product = products.find(p => p.id === productId);
    const updated = { ...product, stock: product.stock.filter(s => s.id !== stockId) };
    updateProduct(updated);
  };

  // ------ OFFERS HANDLERS ------
  const handleApplyTemplate = (tpl) => {
    const today = new Date();
    const start = today.toISOString().split('T')[0];
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    setNewOffer(prev => ({
      ...prev,
      name: tpl.name,
      emoji: tpl.emoji,
      discount: tpl.discount,
      bgColor: tpl.color,
      accentColor: tpl.accentColor,
      startDate: start,
      endDate: end,
    }));
  };

  const handleSaveOffer = (e) => {
    e.preventDefault();
    addOffer({ ...newOffer, discount: Number(newOffer.discount) });
    setShowOfferModal(false);
    setNewOffer(emptyOffer);
  };

  const handleToggleOffer = (offer) => {
    updateOffer({ ...offer, active: !offer.active });
  };

  const isOfferLive = (offer) => {
    if (!offer.active) return false;
    const today = new Date().toISOString().split('T')[0];
    return (!offer.startDate || today >= offer.startDate) && (!offer.endDate || today <= offer.endDate);
  };

  // ======  STYLES  ======
  const inputStyle = { width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', color: 'var(--text-muted)', marginBottom: '6px', fontSize: '0.9rem' };

  return (
    <div style={{ padding: '40px 5%', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '2rem', marginBottom: '5px' }}>Panel CMS</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestión de contenidos, stock, y campañas promocionales.</p>
        </div>
        <Link to="/" className="btn btn-outline">
          <span className="material-icons">home</span> Volver a Tienda
        </Link>
      </div>

      {/* TAB BAR */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px', flexWrap: 'wrap' }}>
        {[
          { key: 'settings', label: '🎭 Textos e Imágenes' },
          { key: 'models',   label: '📂 Familias / Marcas' },
          { key: 'stock',    label: '📦 Celulares Físicos' },
          { key: 'offers',   label: '🎉 Campañas' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`btn ${activeTab !== tab.key ? 'btn-outline' : ''}`}
            style={{ borderRadius: '8px', border: activeTab === tab.key ? 'none' : '1px solid var(--primary)' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== SETTINGS TAB ===== */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '15px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Hero */}
          <div>
            <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '1.3rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>🏠 Página Principal (Hero)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div><label style={labelStyle}>Nombre de la Tienda</label><input type="text" name="storeName" value={localSettings.storeName || ''} onChange={handleSettingsChange} style={inputStyle} required /></div>
              <div><label style={labelStyle}>Badge del Banner (Ej: Ofertas 2026)</label><input type="text" name="heroBadge" value={localSettings.heroBadge || ''} onChange={handleSettingsChange} style={inputStyle} /></div>
              <div><label style={labelStyle}>Título Principal</label><input type="text" name="heroTitle" value={localSettings.heroTitle || ''} onChange={handleSettingsChange} style={inputStyle} /></div>
              <div><label style={labelStyle}>Palabra Resaltada</label><input type="text" name="heroTitleHighlight" value={localSettings.heroTitleHighlight || ''} onChange={handleSettingsChange} style={inputStyle} /></div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>🖼️ Imagen de Fondo del Banner (Hero)</label>
                <input type="url" name="heroImage" value={localSettings.heroImage || ''} onChange={handleSettingsChange} style={inputStyle} placeholder="https://..." />
              </div>
              <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Descripción del Banner</label><textarea name="heroDescription" value={localSettings.heroDescription || ''} onChange={handleSettingsChange} rows="2" style={inputStyle} /></div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '1.3rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>📞 Contacto y Dirección</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={labelStyle}>📱 Número de Teléfono</label>
                <input type="text" name="contactPhone" value={localSettings.contactPhone || ''} onChange={handleSettingsChange} style={inputStyle} placeholder="+1 (809) 555-0123" />
              </div>
              <div>
                <label style={labelStyle}>📍 Dirección de la Tienda</label>
                <input type="text" name="contactAddress" value={localSettings.contactAddress || ''} onChange={handleSettingsChange} style={inputStyle} placeholder="Santo Domingo, República Dominicana" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Descripción en el Footer</label>
                <textarea name="footerDesc" value={localSettings.footerDesc || ''} onChange={handleSettingsChange} rows="2" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* About Section */}
          <div>
            <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '1.3rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>ℹ️ Sección "Acerca de"</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Título de la Sección</label><input type="text" name="aboutTitle" value={localSettings.aboutTitle || ''} onChange={handleSettingsChange} style={inputStyle} /></div>
              <div><label style={labelStyle}>Párrafo 1</label><textarea name="aboutP1" value={localSettings.aboutP1 || ''} onChange={handleSettingsChange} rows="3" style={inputStyle} /></div>
              <div><label style={labelStyle}>Párrafo 2</label><textarea name="aboutP2" value={localSettings.aboutP2 || ''} onChange={handleSettingsChange} rows="3" style={inputStyle} /></div>
              <div><label style={labelStyle}>Estadística 1 – Valor</label><input type="text" name="stat1Value" value={localSettings.stat1Value || ''} onChange={handleSettingsChange} style={inputStyle} /></div>
              <div><label style={labelStyle}>Estadística 1 – Etiqueta</label><input type="text" name="stat1Label" value={localSettings.stat1Label || ''} onChange={handleSettingsChange} style={inputStyle} /></div>
              <div><label style={labelStyle}>Estadística 2 – Valor</label><input type="text" name="stat2Value" value={localSettings.stat2Value || ''} onChange={handleSettingsChange} style={inputStyle} /></div>
              <div><label style={labelStyle}>Estadística 2 – Etiqueta</label><input type="text" name="stat2Label" value={localSettings.stat2Label || ''} onChange={handleSettingsChange} style={inputStyle} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>URL Imagen de la Tienda (Sección "Acerca de")</label><input type="url" name="aboutImage" value={localSettings.aboutImage || ''} onChange={handleSettingsChange} style={inputStyle} /></div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>🖼️ URL Imagen General – sección "¿Por qué elegirnos?" (opcional, aparece al lado de las razones)</label>
                <input type="url" name="whyUsSectionImage" value={localSettings.whyUsSectionImage || ''} onChange={handleSettingsChange} style={inputStyle} placeholder="https://..." />
                {localSettings.whyUsSectionImage && (
                  <img src={localSettings.whyUsSectionImage} alt="Preview" style={{ marginTop: '10px', width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--glass-border)' }} onError={e => e.target.style.display='none'} />
                )}
              </div>
            </div>
          </div>

          {/* Why Us Editor */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px', marginBottom: '20px' }}>
              <h2 style={{ color: 'white', fontSize: '1.3rem', margin: 0 }}>✅ ¿Por qué elegirnos? (Razones)</h2>
              <button type="button" className="btn" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={handleAddWhyUs}>
                <span className="material-icons" style={{ fontSize: '1rem' }}>add</span> Agregar Razón
              </button>
            </div>
            <div style={{ display: 'grid', gap: '15px' }}>
              {(localSettings.whyUsItems || []).map((item, idx) => (
                <div key={item.id || idx} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 2fr auto', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Emoji</label>
                    <input type="text" value={item.icon} onChange={e => handleWhyUsChange(idx, 'icon', e.target.value)} style={{ ...inputStyle, textAlign: 'center', fontSize: '1.5rem', padding: '6px' }} maxLength="4" />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Título</label>
                    <input type="text" value={item.title} onChange={e => handleWhyUsChange(idx, 'title', e.target.value)} style={inputStyle} placeholder="Ej: Garantía Real" />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Descripción</label>
                    <input type="text" value={item.desc} onChange={e => handleWhyUsChange(idx, 'desc', e.target.value)} style={inputStyle} placeholder="Describe esta ventaja..." />
                  </div>
                  <button type="button" onClick={() => handleDeleteWhyUs(idx)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', marginTop: '18px' }}>
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn" style={{ alignSelf: 'flex-start', padding: '12px 30px', fontSize: '1rem' }}>
            <span className="material-icons">save</span> Guardar Todos los Cambios
          </button>
        </form>
      )}

      {/* ===== MODELS TAB ===== */}
      {activeTab === 'models' && (
        <div>
          <button className="btn" onClick={() => setShowModelModal(true)} style={{ marginBottom: '20px' }}>
            <span className="material-icons">add</span> Crear Nueva Marca o Categoría
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {products.map(product => (
              <div key={product.id} className="card" style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                <img src={product.image} alt={product.model} style={{ width: '100%', height: '150px', objectFit: 'contain', background: '#111', borderRadius: '10px' }} />
                <h3 style={{ color: 'white', marginTop: '15px', fontSize: '1.2rem' }}>{product.model}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>{product.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Equipos: {product.stock.length}</span>
                  <button className="action-btn delete-btn" onClick={() => deleteModel(product.id)} title="Eliminar Categoria" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== STOCK TAB ===== */}
      {activeTab === 'stock' && (
        <div>
          {products.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Crea categorías de marcas primero en Familias / Marcas.</p>
          ) : (
            <>
              <button className="btn" onClick={() => { setSelectedProduct(products[0]?.id || ''); setShowStockModal(true); }} style={{ marginBottom: '20px' }}>
                <span className="material-icons">add</span> Ingresar Celular Físico Exacto
              </button>
              <div style={{ display: 'grid', gap: '30px' }}>
                {products.map(product => (
                  <div key={product.id} className="device-list" style={{ marginTop: 0, background: 'var(--bg-card)', borderRadius: '15px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img src={product.image} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px', background: '#111' }} alt={product.model} />
                      <div>
                        <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>{product.brand} - {product.model}</h3>
                        <span className="stock-badge" style={{ marginLeft: 0, background: 'rgba(0, 240, 255, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8em' }}>Inventario: {product.stock.length} unds</span>
                      </div>
                    </div>
                    {product.stock.length === 0 ? (
                      <div style={{ padding: '20px', color: 'var(--text-muted)', textAlign: 'center' }}>Sin teléfonos ingresados.</div>
                    ) : (
                      product.stock.map(item => (
                        <div key={item.id} className="device-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid var(--glass-border)', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{item.specificModel}</span>
                            <span className={`device-grade grade-${item.grade.toLowerCase()}`} style={{ fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', border: '1px solid currentColor' }}>Grado {item.grade}</span>
                            <span style={{ color: 'var(--text-muted)' }}>Bat: {item.battery}%</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <span style={{ fontWeight: 600, color: 'white' }}>RD$ {item.price.toLocaleString()}</span>
                            <button className="action-btn delete-btn" onClick={() => handleDeleteStock(product.id, item.id)} title="Vendido/Eliminar" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                              <span className="material-icons" style={{ color: '#ef4444' }}>delete</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== OFFERS / CAMPAIGNS TAB ===== */}
      {activeTab === 'offers' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ color: 'white', margin: 0, fontSize: '1.4rem' }}>🎉 Campañas Promocionales</h2>
              <p style={{ color: 'var(--text-muted)', margin: '5px 0 0' }}>Crea y activa campañas de temporada que se muestran en la tienda.</p>
            </div>
            <button className="btn" onClick={() => setShowOfferModal(true)}>
              <span className="material-icons">add</span> Nueva Campaña
            </button>
          </div>

          {offers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '15px', border: '2px dashed var(--glass-border)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎊</div>
              <h3 style={{ color: 'white', marginBottom: '10px' }}>No hay campañas aún</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Crea tu primera campaña para mostrar ofertas especiales en la tienda.</p>
              <button className="btn" onClick={() => setShowOfferModal(true)}>Crear Primera Campaña</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {offers.map(offer => {
                const live = isOfferLive(offer);
                return (
                  <div key={offer.id} style={{ borderRadius: '16px', overflow: 'hidden', border: `2px solid ${live ? offer.accentColor || 'var(--primary)' : 'var(--glass-border)'}`, transition: 'all 0.3s' }}>
                    <div style={{ background: offer.bgColor || 'var(--bg-card)', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '2.5rem' }}>{offer.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>{offer.name}</h3>
                        {offer.discount > 0 && <span style={{ color: offer.accentColor || '#00f0ff', fontWeight: 700, fontSize: '1.1rem' }}>{offer.discount}% OFF</span>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: live ? '#4ade80' : '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {live ? '● ACTIVA' : '○ INACTIVA'}
                        </span>
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {offer.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 10px' }}>{offer.description}</p>}
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        {offer.startDate && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '4px' }}>Desde: {offer.startDate}</span>}
                        {offer.endDate && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '4px' }}>Hasta: {offer.endDate}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleToggleOffer(offer)} className={`btn ${offer.active ? '' : 'btn-outline'}`} style={{ flex: 1, padding: '8px', fontSize: '0.85rem', border: offer.active ? 'none' : '1px solid var(--glass-border)' }}>
                          {offer.active ? '✅ Desactivar' : '▶️ Activar'}
                        </button>
                        <button onClick={() => deleteOffer(offer.id)} style={{ background: 'transparent', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', padding: '8px 12px', cursor: 'pointer' }}>
                          <span className="material-icons" style={{ fontSize: '1.1rem', display: 'block' }}>delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== MODAL: STOCK ===== */}
      {showStockModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(5px)' }}>
          <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '15px', padding: '30px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Registrar Teléfono Físico</h2>
            <form onSubmit={handleAddStock}>
              <label style={labelStyle}>Marca / Categoría</label>
              <select style={{ ...inputStyle, marginBottom: '15px' }} value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                <option value="">-- Elige la Familia --</option>
                {products.map(p => <option key={p.id} value={p.id} style={{ background: 'var(--bg-dark)' }}>{p.model}</option>)}
              </select>
              <label style={labelStyle}>Modelo Específico (Ej: iPhone 14 Pro Max 256GB)</label>
              <input type="text" required placeholder="Escribe el modelo exacto del equipo" value={newStock.specificModel} onChange={e => setNewStock({ ...newStock, specificModel: e.target.value })} style={{ ...inputStyle, marginBottom: '15px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={labelStyle}>Grado Real</label>
                  <select value={newStock.grade} onChange={e => setNewStock({ ...newStock, grade: e.target.value })} style={inputStyle}>
                    <option value="A" style={{ background: 'var(--bg-dark)' }}>Grado A</option>
                    <option value="B" style={{ background: 'var(--bg-dark)' }}>Grado B</option>
                    <option value="C" style={{ background: 'var(--bg-dark)' }}>Grado C</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Batería %</label>
                  <input type="number" min="1" max="100" required value={newStock.battery} onChange={e => setNewStock({ ...newStock, battery: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <label style={labelStyle}>Precio (RD$)</label>
              <input type="number" required placeholder="Ej: 35000" value={newStock.price} onChange={e => setNewStock({ ...newStock, price: e.target.value })} style={{ ...inputStyle, marginBottom: '20px' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn" style={{ flex: 1 }} disabled={!selectedProduct}>Ingresar Equipo</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowStockModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: NEW MODEL ===== */}
      {showModelModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(5px)' }}>
          <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '15px', padding: '30px', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Crear Nueva Marca/Categoría</h2>
            <form onSubmit={handleAddModel}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div><label style={labelStyle}>Marca</label><input type="text" required placeholder="Ej: Apple" value={newModel.brand} onChange={e => setNewModel({ ...newModel, brand: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Nombre en Menú</label><input type="text" required placeholder="Ej: Catálogo iPhone" value={newModel.model} onChange={e => setNewModel({ ...newModel, model: e.target.value })} style={inputStyle} /></div>
              </div>
              <label style={labelStyle}>URL de la Imagen Promocional</label>
              <input type="url" required placeholder="https://..." value={newModel.image} onChange={e => setNewModel({ ...newModel, image: e.target.value })} style={{ ...inputStyle, marginBottom: '15px' }} />
              <label style={labelStyle}>Descripción de la Categoría</label>
              <textarea required rows="2" value={newModel.description} onChange={e => setNewModel({ ...newModel, description: e.target.value })} style={{ ...inputStyle, marginBottom: '20px' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>Guardar Nueva Categ.</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModelModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: NEW OFFER ===== */}
      {showOfferModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(5px)' }}>
          <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '15px', padding: '30px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ color: 'white', marginBottom: '8px' }}>🎉 Nueva Campaña Promocional</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>Aplica una plantilla o configura manualmente.</p>
            
            {/* Templates */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ ...labelStyle, marginBottom: '10px' }}>⚡ Plantillas Rápidas</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {OFFER_TEMPLATES.map(tpl => (
                  <button key={tpl.name} type="button" onClick={() => handleApplyTemplate(tpl)}
                    style={{ background: tpl.color, border: `1px solid ${tpl.accentColor}`, borderRadius: '8px', color: 'white', padding: '8px 14px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}>
                    {tpl.emoji} {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveOffer}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '15px', marginBottom: '15px' }}>
                <div><label style={labelStyle}>Emoji</label><input type="text" value={newOffer.emoji} onChange={e => setNewOffer({ ...newOffer, emoji: e.target.value })} style={{ ...inputStyle, textAlign: 'center', fontSize: '1.5rem', padding: '8px' }} maxLength="4" /></div>
                <div><label style={labelStyle}>Nombre de la Campaña *</label><input type="text" required placeholder="Ej: Black Friday 2026" value={newOffer.name} onChange={e => setNewOffer({ ...newOffer, name: e.target.value })} style={inputStyle} /></div>
              </div>
              
              <div><label style={labelStyle}>Descripción (opcional)</label><textarea rows="2" placeholder="Ej: ¡Los mejores descuentos del año en todos nuestros equipos!" value={newOffer.description} onChange={e => setNewOffer({ ...newOffer, description: e.target.value })} style={{ ...inputStyle, marginBottom: '15px' }} /></div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                <div><label style={labelStyle}>% Descuento (0 = sin descuento)</label><input type="number" min="0" max="99" value={newOffer.discount} onChange={e => setNewOffer({ ...newOffer, discount: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Fecha Inicio</label><input type="date" value={newOffer.startDate} onChange={e => setNewOffer({ ...newOffer, startDate: e.target.value })} style={{ ...inputStyle, colorScheme: 'dark' }} /></div>
                <div><label style={labelStyle}>Fecha Fin</label><input type="date" value={newOffer.endDate} onChange={e => setNewOffer({ ...newOffer, endDate: e.target.value })} style={{ ...inputStyle, colorScheme: 'dark' }} /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Color de Fondo</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="color" value={newOffer.bgColor} onChange={e => setNewOffer({ ...newOffer, bgColor: e.target.value })} style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }} />
                    <input type="text" value={newOffer.bgColor} onChange={e => setNewOffer({ ...newOffer, bgColor: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Color de Acento</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="color" value={newOffer.accentColor} onChange={e => setNewOffer({ ...newOffer, accentColor: e.target.value })} style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }} />
                    <input type="text" value={newOffer.accentColor} onChange={e => setNewOffer({ ...newOffer, accentColor: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div style={{ background: newOffer.bgColor, borderRadius: '10px', padding: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', border: `2px solid ${newOffer.accentColor}` }}>
                <span style={{ fontSize: '2rem' }}>{newOffer.emoji}</span>
                <div>
                  <div style={{ color: 'white', fontWeight: 700 }}>{newOffer.name || 'Nombre de la Campaña'}</div>
                  {newOffer.discount > 0 && <div style={{ color: newOffer.accentColor, fontWeight: 700 }}>{newOffer.discount}% OFF en todos los equipos</div>}
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', marginBottom: '20px', cursor: 'pointer' }}>
                <input type="checkbox" checked={newOffer.active} onChange={e => setNewOffer({ ...newOffer, active: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                Activar campaña inmediatamente
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>🚀 Publicar Campaña</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setShowOfferModal(false); setNewOffer(emptyOffer); }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
