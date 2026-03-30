import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';

export default function Admin() {
  const { products, updateProduct, addNewModel, deleteModel, settings, updateSettings } = useInventory();
  
  const [activeTab, setActiveTab] = useState('models'); // settings, models, stock

  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '');
  const [showStockModal, setShowStockModal] = useState(false);
  const [newStock, setNewStock] = useState({ specificModel: '', grade: 'A', battery: 100, price: '' });

  const [localSettings, setLocalSettings] = useState(settings);
  const [showModelModal, setShowModelModal] = useState(false);
  const [newModel, setNewModel] = useState({ brand: '', model: '', image: '', description: '', basePrice: '' });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings(localSettings);
    alert('Configuración guardada exitosamente.');
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: value }));
  };

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

  return (
    <div style={{ padding: '40px 5%', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <div className="header-admin" style={{background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <div>
          <h1 style={{ color: 'white', fontSize: '2rem', marginBottom: '5px' }}>Panel CMS</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configuración de marcas, y control detallado de stock ingresado a mano.</p>
        </div>
        <Link to="/" className="btn btn-outline">
          <span className="material-icons">home</span> Volver a Tienda
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('settings')} className={`btn ${activeTab !== 'settings' ? 'btn-outline' : ''}`} style={{ border: activeTab === 'settings' ? 'none' : '1px solid var(--primary)', borderRadius: '8px' }}>🎭 Textos e Imágenes</button>
        <button onClick={() => setActiveTab('models')} className={`btn ${activeTab !== 'models' ? 'btn-outline' : ''}`} style={{ border: activeTab === 'models' ? 'none' : '1px solid var(--primary)', borderRadius: '8px' }}>📂 Familias / Marcas</button>
        <button onClick={() => setActiveTab('stock')} className={`btn ${activeTab !== 'stock' ? 'btn-outline' : ''}`} style={{ border: activeTab === 'stock' ? 'none' : '1px solid var(--primary)', borderRadius: '8px' }}>📦 Celulares Físicos</button>
      </div>

      {activeTab === 'settings' && (
        /* Settings Tab - Mismo código */
        <form onSubmit={handleSaveSettings} style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '15px', border: '1px solid var(--glass-border)' }}>
          <h2 style={{ color: 'white', marginBottom: '20px' }}>Ajustes de la Página de Inicio</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div><label className="form-label" style={{color: 'var(--text-muted)'}}>Nombre de la Tienda</label><input type="text" name="storeName" value={localSettings.storeName} onChange={handleSettingsChange} className="form-input" style={{width:'100%', padding:'12px', background:'rgba(255,255,255,0.05)', borderRadius:'8px', color:'white'}} required /></div>
            <div><label className="form-label" style={{color: 'var(--text-muted)'}}>Badge del Banner (Ej: Ofertas 2026)</label><input type="text" name="heroBadge" value={localSettings.heroBadge} onChange={handleSettingsChange} className="form-input" style={{width:'100%', padding:'12px', background:'rgba(255,255,255,0.05)', borderRadius:'8px', color:'white'}} /></div>
            <div><label className="form-label" style={{color: 'var(--text-muted)'}}>Título Principal</label><input type="text" name="heroTitle" value={localSettings.heroTitle} onChange={handleSettingsChange} className="form-input" style={{width:'100%', padding:'12px', background:'rgba(255,255,255,0.05)', borderRadius:'8px', color:'white'}} /></div>
            <div><label className="form-label" style={{color: 'var(--text-muted)'}}>Palabra Resaltada</label><input type="text" name="heroTitleHighlight" value={localSettings.heroTitleHighlight} onChange={handleSettingsChange} className="form-input" style={{width:'100%', padding:'12px', background:'rgba(255,255,255,0.05)', borderRadius:'8px', color:'white'}} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label className="form-label" style={{color: 'var(--text-muted)'}}>Descripción del Banner</label><textarea name="heroDescription" value={localSettings.heroDescription} onChange={handleSettingsChange} rows="2" style={{width:'100%', padding:'12px', background:'rgba(255,255,255,0.05)', borderRadius:'8px', color:'white'}}></textarea></div>
          </div>
          <button type="submit" className="btn" style={{ marginTop: '20px' }}>Guardar Cambios</button>
        </form>
      )}

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
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Equipos: {product.stock.length}</span>
                  <button className="action-btn delete-btn" onClick={() => deleteModel(product.id)} title="Eliminar Categoria" style={{background: 'transparent', border:'none', cursor:'pointer', color:'var(--text-muted)'}}>
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stock' && (
        <div>
          {products.length === 0 ? (
             <p style={{ color: 'var(--text-muted)' }}>Crea categorías de marcas primero en Familias / Marcas.</p>
          ) : (
            <>
              <button className="btn" onClick={() => setShowStockModal(true)} style={{ marginBottom: '20px' }}>
                <span className="material-icons">add</span> Ingresar Celular Físico Exacto
              </button>
              <div style={{ display: 'grid', gap: '30px' }}>
                {products.map(product => (
                  <div key={product.id} className="device-list" style={{ marginTop: 0, background: 'var(--bg-card)', borderRadius: '15px', border:'1px solid var(--glass-border)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img src={product.image} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px', background: '#111' }} />
                      <div>
                        <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>{product.brand} - {product.model}</h3>
                        <span className="stock-badge" style={{ marginLeft: 0, background: 'rgba(0, 240, 255, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8em' }}>Inventario: {product.stock.length} unds</span>
                      </div>
                    </div>
                    {product.stock.length === 0 ? (
                      <div style={{ padding: '20px', color: 'var(--text-muted)', textAlign: 'center' }}>Sin teléfonos ingresados.</div>
                    ) : (
                      product.stock.map(item => (
                        <div key={item.id} className="device-item" style={{display: 'flex', justifyContent:'space-between', padding:'15px 20px', borderBottom:'1px solid var(--glass-border)', flexWrap: 'wrap', gap: '10px'}}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{color: 'white', fontWeight: 700, fontSize:'1.1rem'}}>{item.specificModel}</span>
                            <span className={`device-grade grade-${item.grade.toLowerCase()}`} style={{fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', border: '1px solid currentColor'}}>Grado {item.grade}</span>
                            <span style={{ color: 'var(--text-muted)' }}>Bat: {item.battery}%</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <span style={{ fontWeight: 600, color: 'white' }}>RD$ {item.price.toLocaleString()}</span>
                            <button className="action-btn delete-btn" onClick={() => handleDeleteStock(product.id, item.id)} title="Vendido/Eliminar" style={{background: 'transparent', border:'none', cursor:'pointer'}}>
                              <span className="material-icons" style={{color: '#ef4444'}}>delete</span>
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

      {/* --- MODALS --- */}
      {showStockModal && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(5px)'}}>
          <div className="modal-content" style={{background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '15px', padding: '30px', width: '90%', maxWidth: '500px'}}>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Registrar Teléfono Físico</h2>
            <form onSubmit={handleAddStock}>
              <label className="form-label" style={{display: 'block', color: 'var(--text-muted)', marginBottom: '5px'}}>Seleccione la Marca / Categoría</label>
              <select className="form-input" style={{width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', marginBottom: '15px'}} value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                <option value="">-- Elige la Familia --</option>
                {products.map(p => <option key={p.id} value={p.id} style={{background: 'var(--bg-dark)'}}>{p.model}</option>)}
              </select>

              <label className="form-label" style={{display: 'block', color: 'var(--text-muted)', marginBottom: '5px'}}>Nombre del Modelo Específico (Ej: iPhone 14 Pro Max 256GB)</label>
              <input type="text" required placeholder="Escribe el modelo exacto del equipo" className="form-input" value={newStock.specificModel} onChange={e => setNewStock({...newStock, specificModel: e.target.value})} style={{width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', marginBottom: '15px'}} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label className="form-label" style={{display: 'block', color: 'var(--text-muted)', marginBottom: '5px'}}>Grado Real</label>
                  <select className="form-input" value={newStock.grade} onChange={e => setNewStock({...newStock, grade: e.target.value})} style={{width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white'}}>
                    <option value="A" style={{background: 'var(--bg-dark)'}}>Grado A</option>
                    <option value="B" style={{background: 'var(--bg-dark)'}}>Grado B</option>
                    <option value="C" style={{background: 'var(--bg-dark)'}}>Grado C</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{display: 'block', color: 'var(--text-muted)', marginBottom: '5px'}}>Cond. Batería %</label>
                  <input type="number" min="1" max="100" required className="form-input" value={newStock.battery} onChange={e => setNewStock({...newStock, battery: e.target.value})} style={{width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white'}} />
                </div>
              </div>

              <label className="form-label" style={{display: 'block', color: 'var(--text-muted)', marginBottom: '5px'}}>Precio del Equipo (RD$)</label>
              <input type="number" required placeholder="Ej: 35000" className="form-input" value={newStock.price} onChange={e => setNewStock({...newStock, price: e.target.value})} style={{width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white'}} />

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn" style={{ flex: 1 }} disabled={!selectedProduct}>Ingresar Equipo</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowStockModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModelModal && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(5px)'}}>
          <div className="modal-content" style={{background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '15px', padding: '30px', width: '90%', maxWidth: '500px'}}>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Crear Nueva Marca/Categoría</h2>
            <form onSubmit={handleAddModel}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label className="form-label" style={{color: 'var(--text-muted)', marginBottom: '5px'}}>Marca</label>
                  <input type="text" required placeholder="Ej: Apple" className="form-input" value={newModel.brand} onChange={e => setNewModel({...newModel, brand: e.target.value})} style={{width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'white'}} />
                </div>
                <div>
                  <label className="form-label" style={{color: 'var(--text-muted)', marginBottom: '5px'}}>Nombre en Menú</label>
                  <input type="text" required placeholder="Ej: Catálogo iPhone" className="form-input" value={newModel.model} onChange={e => setNewModel({...newModel, model: e.target.value})} style={{width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'white'}} />
                </div>
              </div>

              <label className="form-label" style={{color: 'var(--text-muted)'}}>URL de la Imagen Promocional</label>
              <input type="url" required placeholder="https://..." className="form-input" value={newModel.image} onChange={e => setNewModel({...newModel, image: e.target.value})} style={{width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'white', marginBottom: '15px'}} />

              <label className="form-label" style={{color: 'var(--text-muted)'}}>Descripción de la Categoría</label>
              <textarea required rows="2" className="form-input" value={newModel.description} onChange={e => setNewModel({...newModel, description: e.target.value})} style={{width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'white'}}></textarea>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>Guardar Nueva Categ.</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModelModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
