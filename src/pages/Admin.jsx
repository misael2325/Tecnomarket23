import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const OFFER_TEMPLATES = [
  { name: 'Black Friday', emoji: '🖤', discount: 30, color: '#111111', accentColor: '#f59e0b' },
  { name: 'Navidad', emoji: '🎄', discount: 20, color: '#065f46', accentColor: '#f87171' },
  { name: 'Día del Amor', emoji: '❤️', discount: 15, color: '#881337', accentColor: '#fda4af' },
  { name: 'Día de las Madres', emoji: '🌸', discount: 15, color: '#701a75', accentColor: '#f0abfc' },
  { name: 'Año Nuevo', emoji: '🎆', discount: 25, color: '#1e1b4b', accentColor: '#818cf8' },
  { name: 'Aniversario', emoji: '🥳', discount: 10, color: '#1c1917', accentColor: '#00f0ff' },
];

// DEPARTMENTS ahora dinámico desde context
// const DEPARTMENTS = [...]

const emptyCategory = {
  model: '',
  description: '',
  image: '',
  basePrice: 0,
  department: '',
};

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
  image: '',
};

export default function Admin() {
const { 
    products, addProduct, deleteProduct, updateProduct, 
    settings, updateSettings,
    offers, addOffer, updateOffer, deleteOffer,
    departments, updateDepartments, restoreBackup
  } = useInventory();
  
  const { isSuperAdmin } = useAuth();
  
  const [activeTab, setActiveTab] = useState('settings');

  // --- Stock Tab State ---
  const [selectedProduct, setSelectedProduct] = useState('');
  const [showStockModal, setShowStockModal] = useState(false);
  const [newStock, setNewStock] = useState({ specificModel: '', grade: 'A', battery: 100, price: '' });

  // --- Settings Tab State ---
  const [localSettings, setLocalSettings] = useState(settings);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // --- Departments Management ---
  const [newDepartment, setNewDepartment] = useState('');
  const [editingDepartmentIndex, setEditingDepartmentIndex] = useState(-1);
  const [tempDepartmentName, setTempDepartmentName] = useState('');

  // --- Offers Tab State ---
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [newOffer, setNewOffer] = useState(emptyOffer);

  // --- Price Editing State ---
  // key: `${productId}-${stockId}` => edited price string
  const [editingPrices, setEditingPrices] = useState({});

  // --- Users Tab State ---
  const [users, setUsers] = useState([]);

  // Sync localSettings when global settings load from Firebase
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleFileUpload = (e, field, isSettings = true, callback = null) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 1024 * 1024) {
      alert("La imagen es muy pesada. Intenta con una menor a 1MB para un mejor rendimiento.");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      if (isSettings) {
        setLocalSettings(prev => ({ ...prev, [field]: base64 }));
      } else if (callback) {
        callback(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Sync Users
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const items = [];
      snapshot.forEach(doc => items.push({ ...doc.data(), id: doc.id }));
      setUsers(items);
    });
    return () => unsubUsers();
  }, []);

  const ImageInput = ({ label, name, value, onChange, onUpload, placeholder }) => (
    <div style={{ marginBottom: '24px' }}>
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', gap: '12px' }}>
        <input 
          type="url" 
          name={name} 
          value={value || ''} 
          onChange={onChange} 
          className="form-input"
          style={{ flex: 1, margin: 0 }}
          placeholder={placeholder || "https://..."} 
        />
        <label className="btn" style={{ cursor: 'pointer', padding: '0 24px' }}>
          <span className="material-symbols-outlined">upload</span>
          Subir
          <input type="file" accept="image/*" onChange={onUpload} style={{ display: 'none' }} />
        </label>
      </div>
      {value && (
        <div style={{ marginTop: '16px', position: 'relative', borderRadius: 'var(--lg-radius)', overflow: 'hidden', height: '140px', background: 'var(--surface-container)' }}>
          <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      )}
    </div>
  );

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

  const handleInstagramPhotoChange = (index, value) => {
    const updated = [...(localSettings.instagramPhotos || [])];
    updated[index] = value;
    setLocalSettings(prev => ({ ...prev, instagramPhotos: updated }));
  };

  // ------ MODELS HANDLERS ------
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newProduct = {
      brand: formData.get('brand'),
      model: formData.get('model'),
      description: formData.get('description'),
      image: formData.get('image'),
      department: formData.get('department'),
      basePrice: 0,
      stock: []
    };
    
    if (editingProduct) {
      await updateProduct({ 
        ...newProduct, 
        id: editingProduct.id, 
        stock: editingProduct.stock || [] 
      });
    } else {
      await addProduct(newProduct);
    }
    
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleEditProduct = (p) => {
    setEditingProduct(p);
    setShowProductModal(true);
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

  const handleSavePrice = (productId, stockId) => {
    const product = products.find(p => p.id === productId);
    const key = `${productId}-${stockId}`;
    const newPrice = Number(editingPrices[key]);
    if (!newPrice || isNaN(newPrice)) { alert('Ingresa un precio válido.'); return; }
    const updatedStock = product.stock.map(s =>
      s.id === stockId ? { ...s, price: newPrice } : s
    );
    updateProduct({ ...product, stock: updatedStock });
    setEditingPrices(prev => { const n = { ...prev }; delete n[key]; return n; });
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

  // --- USER MANAGEMENT HANDLERS ---
  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await updateDoc(doc(db, "users", userId), { status: newStatus });
      alert(`Usuario actualizado a: ${newStatus}`);
    } catch (e) { console.error("Error actualizando usuario:", e); }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await deleteDoc(doc(db, "users", userId));
        alert('Usuario eliminado.');
      } catch (e) { console.error("Error eliminando usuario:", e); }
    }
  };
  
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      alert(`Rol actualizado a: ${newRole}`);
    } catch (e) { console.error("Error actualizando rol:", e); }
  };

  // --- CONFIG / BACKUP HANDLERS ---
  const handleExportBackup = () => {
    const backupData = {
      categories: products,
      settings: settings,
      offers: offers,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_tecnomarket_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert('✅ Backup exportado correctamente.');
  };

  const handleImportBackup = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!window.confirm('🚨 ¡AVISO CRÍTICO!\n\nRestaurar un backup sobrescribirá cualquier dato con el mismo ID en el sistema. ¿Estás absolutamente seguro de continuar?')) {
      e.target.value = ''; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const success = await restoreBackup(data);
        if (success) {
          alert('✅ Sistema restaurado con éxito.');
        } else {
          alert('❌ Hubo un error al restaurar los datos.');
        }
      } catch (err) {
        alert('❌ Error al leer el archivo de backup. Asegúrate de que sea un JSON válido.');
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900 icon
    doc.text(settings.storeName || 'TecnoMarket', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Reporte de Inventario de Todo el Sistema - ${today}`, 14, 30);
    
    const tableData = [];
    products.forEach(p => {
      if (p.stock && p.stock.length > 0) {
        p.stock.forEach(item => {
          tableData.push([
            p.brand,
            p.model,
            item.specificModel,
            `Grado ${item.grade}`,
            item.battery > 0 ? `${item.battery}%` : 'N/A',
            `RD$ ${item.price.toLocaleString('en-US', { minimumFractionDigits: 0 })}`
          ]);
        });
      }
    });

    doc.autoTable({
      startY: 35,
      head: [['Marca', 'Familia', 'Modelo Exacto', 'Grado', 'Batería', 'Precio']],
      body: tableData,
      headStyles: { fillColor: [0, 240, 255], textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 8 },
      margin: { top: 35 },
    });

    doc.save(`inventario_${today.replace(/\//g, '-')}.pdf`);
  };

  // ======  STYLES  ======
  const inputStyle = { width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', color: 'var(--text-muted)', marginBottom: '6px', fontSize: '0.9rem' };

  return (
    <div style={{ padding: '40px 8%', minHeight: '100vh', background: 'var(--background)' }}>
      {/* HEADER ADMIN */}
      <div className="header-admin">
        <div>
          <span className="badge" style={{ marginBottom: '8px' }}>Admin Dashboard</span>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-2px' }}>
            Control <span style={{ color: 'var(--primary)' }}>Curation</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined">home</span>
            Vista Cliente
          </Link>
          <button onClick={() => logout()} className="btn" style={{ background: 'var(--surface-container-highest)', color: 'var(--on-surface)' }}>
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS - EDITORIAL STYLE */}
      <div style={{ 
        display: 'flex', 
        gap: '32px', 
        marginBottom: '64px', 
        borderBottom: '1px solid var(--outline-variant)',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        {[
          { key: 'settings', label: 'Identidad', icon: 'palette' },
          { key: 'models',   label: 'Familias', icon: 'inventory_2' },
          { key: 'stock',    label: 'Inventario', icon: 'box' },
          { key: 'offers',   label: 'Campañas', icon: 'campaign' },
          { key: 'users',    label: 'Equipo', icon: 'group' },
          { key: 'config',   label: 'Sistema', icon: 'settings' },
        ].filter(tab => (tab.key !== 'users' && tab.key !== 'config') || isSuperAdmin).map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button 
              key={tab.key} 
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: 'none',
                border: 'none',
                padding: '16px 0',
                color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: `2px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                transition: 'var(--transition)',
                opacity: isActive ? 1 : 0.6
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ===== SETTINGS TAB ===== */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} style={{ display: 'grid', gap: '48px' }}>
          
          {/* Identity Section */}
          <div style={{ background: 'var(--surface-container-low)', padding: '48px', borderRadius: 'var(--xl-radius)' }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>auto_awesome</span>
              Identidad de Marca
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              <div>
                <label className="form-label">Nombre Comercial</label>
                <input type="text" name="storeName" value={localSettings.storeName || ''} onChange={handleSettingsChange} className="form-input" required />
              </div>
              <ImageInput 
                label="Logotipo o Hero Image" 
                name="heroImage" 
                value={localSettings.heroImage} 
                onChange={handleSettingsChange} 
                onUpload={(e) => handleFileUpload(e, 'heroImage')}
              />
            </div>
            <div style={{ marginTop: '32px' }}>
              <label className="form-label">Eslogan Editorial</label>
              <textarea name="footerDesc" value={localSettings.footerDesc || ''} onChange={handleSettingsChange} rows="2" className="form-input" />
            </div>
          </div>

          {/* Hero Content Section */}
          <div style={{ background: 'var(--surface-container-low)', padding: '48px', borderRadius: 'var(--xl-radius)' }}>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>campaign</span>
              Comunicación Hero
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div><label className="form-label">Título Principal</label><input type="text" name="heroTitle" value={localSettings.heroTitle || ''} onChange={handleSettingsChange} className="form-input" /></div>
              <div><label className="form-label">Destaque</label><input type="text" name="heroTitleHighlight" value={localSettings.heroTitleHighlight || ''} onChange={handleSettingsChange} className="form-input" /></div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Subtítulo Descriptivo</label>
                <textarea name="heroDescription" value={localSettings.heroDescription || ''} onChange={handleSettingsChange} rows="2" className="form-input" />
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div style={{ background: 'var(--surface-container-low)', padding: '48px', borderRadius: 'var(--xl-radius)' }}>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)' }}>contact_support</span>
              Puntos de Contacto
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              <div><label className="form-label">Email Corporativo</label><input type="email" name="contactEmail" value={localSettings.contactEmail || ''} onChange={handleSettingsChange} className="form-input" /></div>
              <div><label className="form-label">WhatsApp de Ventas</label><input type="text" name="contactPhone" value={localSettings.contactPhone || ''} onChange={handleSettingsChange} className="form-input" /></div>
              <div style={{ gridColumn: 'span 2' }}><label className="form-label">Dirección Flagship</label><input type="text" name="contactAddress" value={localSettings.contactAddress || ''} onChange={handleSettingsChange} className="form-input" /></div>
            </div>
          </div>

          {/* Nuestra Historia / About Section Editor */}
          <div style={{ background: 'var(--surface-container-low)', padding: '48px', borderRadius: 'var(--xl-radius)' }}>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>auto_stories</span>
              Nuestra Historia (Sección About)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div>
                <label className="form-label">Título de la Sección</label>
                <input type="text" name="aboutTitle" value={localSettings.aboutTitle || ''} onChange={handleSettingsChange} className="form-input" placeholder="Ej: Excelencia en cada detalle" />
              </div>
              <div style={{ gridColumn: 'span 1' }}>
                <label className="form-label">Subtítulo / Cita</label>
                <input type="text" name="aboutQuote" value={localSettings.aboutQuote || ''} onChange={handleSettingsChange} className="form-input" placeholder="Ej: La tecnología simplifica la vida..." />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Texto Descriptivo</label>
                <textarea name="aboutDesc" value={localSettings.aboutDesc || ''} onChange={handleSettingsChange} rows="4" className="form-input" placeholder="Cuéntanos la historia de tu tienda..." />
              </div>
            </div>
            <div style={{ marginTop: '32px' }}>
              <ImageInput
                label="Foto de Nuestra Historia"
                name="aboutImage"
                value={localSettings.aboutImage}
                onChange={handleSettingsChange}
                onUpload={(e) => handleFileUpload(e, 'aboutImage')}
                placeholder="URL de la foto o sube una imagen..."
              />
            </div>
          </div>

          {/* Why Us Editor */}
          <div style={{ background: 'var(--surface-container-low)', padding: '48px', borderRadius: 'var(--xl-radius)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>verified</span>
                Propuesta de Valor (Home)
              </h3>
              <button type="button" className="btn btn-outline" onClick={handleAddWhyUs}>
                <span className="material-symbols-outlined">add</span>
                Nuevo Item
              </button>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              {(localSettings.whyUsItems || []).map((item, idx) => (
                <div key={item.id || idx} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 2fr auto', gap: '24px', alignItems: 'center', background: 'var(--surface-container)', padding: '24px', borderRadius: 'var(--lg-radius)' }}>
                  <div>
                    <label className="form-label">Icono</label>
                    <input type="text" value={item.icon} onChange={e => handleWhyUsChange(idx, 'icon', e.target.value)} className="form-input" style={{ textAlign: 'center', fontSize: '1.5rem', padding: '12px' }} />
                  </div>
                  <div>
                    <label className="form-label">Título</label>
                    <input type="text" value={item.title} onChange={e => handleWhyUsChange(idx, 'title', e.target.value)} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Descripción Curada</label>
                    <input type="text" value={item.desc} onChange={e => handleWhyUsChange(idx, 'desc', e.target.value)} className="form-input" />
                  </div>
                  <button type="button" onClick={() => handleDeleteWhyUs(idx)} style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', marginTop: '16px' }}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <button type="submit" className="btn" style={{ padding: '16px 48px' }}>
              <span className="material-symbols-outlined">check_circle</span>
              Publicar Cambios
            </button>
          </div>
        </form>
      )}

      {activeTab === 'models' && (
        <div style={{ display: 'grid', gap: '48px' }}>
          {/* DEPARTMENTS - EDITORIAL LIST */}
          <div style={{ background: 'var(--surface-container-low)', padding: '48px', borderRadius: 'var(--xl-radius)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>category</span>
                Arquitectura de Catálogo
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <input 
                type="text" 
                placeholder="Nombre de la nueva familia..." 
                value={newDepartment} 
                onChange={e => setNewDepartment(e.target.value.trim())} 
                className="form-input"
                style={{ flex: 1, margin: 0 }}
              />
              <button 
                className="btn" 
                onClick={() => {
                  if (newDepartment && !departments.includes(newDepartment)) {
                    updateDepartments([...departments, newDepartment]);
                    setNewDepartment('');
                  }
                }}
              >
                Crear Grupo
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {departments.map((dept, index) => (
                <div key={dept} style={{ 
                  background: 'var(--surface-container)', 
                  padding: '12px 24px', 
                  borderRadius: '100px',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px' 
                }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{dept}</span>
                  <button onClick={() => updateDepartments(departments.filter((_, i) => i !== index))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', display: 'flex' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', letterSpacing: '-1px' }}>Familias Curadas</h2>
            <button className="btn" onClick={() => { setEditingProduct(null); setShowProductModal(true); }}>
              <span className="material-symbols-outlined">add</span>
              Nueva Familia
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
            {/* MAIN CATEGORIES BY DEPARTMENT */}
            {departments.map(dept => {
              const deptProducts = products.filter(p => (p.department || 'Celulares') === dept);
              if (deptProducts.length === 0) return null;
              
              return (
                <div key={dept}>
                  <h3 style={{ color: 'var(--primary)', marginBottom: '15px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-icons">
                      {dept === 'Celulares' ? 'smartphone' : 
                       dept === 'Laptops & Computadoras' ? 'laptop' :
                       dept === 'Tablets' ? 'tablet' :
                       dept === 'Smartwatches' ? 'watch' :
                       dept === 'TV & Entretenimiento' ? 'tv' : 'settings_input_component'}
                    </span>
                    {dept}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {deptProducts.map(product => (
                      <div key={product.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '15px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '140px', background: '#111', overflow: 'hidden', position: 'relative' }}>
                          <img src={product.image} alt={product.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                            <button onClick={() => handleEditProduct(product)} style={{ background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                              <span className="material-icons" style={{ fontSize: '1.2rem' }}>edit</span>
                            </button>
                            <button onClick={() => deleteProduct(product.id)} style={{ background: 'rgba(255,0,0,0.6)', color: 'white', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                              <span className="material-icons" style={{ fontSize: '1.2rem' }}>delete</span>
                            </button>
                          </div>
                        </div>
                        <div style={{ padding: '15px' }}>
                          <h4 style={{ color: 'white', margin: '0 0 5px 0' }}>{product.model}</h4>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', height: '40px', overflow: 'hidden' }}>{product.description}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Stock: {product.stock.length}</span>
                            <button onClick={() => { setSelectedProduct(product.id); setShowStockModal(true); }} className="btn" style={{ padding: '5px 12px', fontSize: '0.8rem' }}>Gestionar Stock</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {/* FALLBACK: UNCLASSIFIED FAMILIES */}
            {(() => {
                const classifiedIds = new Set();
                departments.forEach(dept => {
                    products.filter(p => (p.department || 'Celulares') === dept).forEach(p => classifiedIds.add(p.id));
                });
                const unclassified = products.filter(p => !classifiedIds.has(p.id));
                
                if (unclassified.length === 0) return null;
                
                return (
                  <div style={{ marginTop: '40px', borderTop: '2px dashed var(--glass-border)', paddingTop: '40px' }}>
                    <h3 style={{ color: '#94a3b8', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="material-icons">help_outline</span>
                      Otros / Equipos sin Clasificar
                      <span style={{ fontSize: '0.8rem', fontWeight: 'normal', fontStyle: 'italic' }}>(Departamentos no encontrados o antiguos)</span>
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                      {unclassified.map(product => (
                        <div key={product.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '15px', overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: 0.8 }}>
                          <div style={{ height: '140px', background: '#111', overflow: 'hidden', position: 'relative' }}>
                            <img src={product.image} alt={product.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                              <button onClick={() => handleEditProduct(product)} style={{ background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                                <span className="material-icons" style={{ fontSize: '1.2rem' }}>edit</span>
                              </button>
                              <button onClick={() => deleteProduct(product.id)} style={{ background: 'rgba(255,0,0,0.6)', color: 'white', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                                <span className="material-icons" style={{ fontSize: '1.2rem' }}>delete</span>
                              </button>
                            </div>
                          </div>
                          <div style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h4 style={{ color: 'white', margin: '0 0 5px 0' }}>{product.model}</h4>
                                <span style={{ fontSize: '0.7rem', background: '#334155', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>{product.department || 'Sin Dept.'}</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', height: '40px', overflow: 'hidden' }}>{product.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                              <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Stock: {product.stock.length}</span>
                              <button onClick={() => { setSelectedProduct(product.id); setShowStockModal(true); }} className="btn" style={{ padding: '5px 12px', fontSize: '0.8rem' }}>Gestionar Stock</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
            })()}
          </div>
        </div>
      )}

      {/* ===== STOCK TAB ===== */}
      {activeTab === 'stock' && (
        <div style={{ display: 'grid', gap: '48px' }}>
          {products.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', background: 'var(--surface-container-low)', borderRadius: 'var(--xl-radius)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--on-surface-variant)', marginBottom: '16px' }}>inventory</span>
              <p style={{ color: 'var(--on-surface-variant)' }}>Crea categorías de marca primero para gestionar el inventario.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', letterSpacing: '-1px' }}>Existencias Físicas</h2>
                <button className="btn" onClick={() => { setSelectedProduct(products[0]?.id || ''); setShowStockModal(true); }}>
                  <span className="material-symbols-outlined">add_box</span>
                  Ingresar Equipo
                </button>
              </div>
                <div style={{ display: 'grid', gap: '48px' }}>
                  {departments.map(dept => {
                    const deptProducts = products.filter(p => (p.department || 'Celulares') === dept);
                    if (deptProducts.length === 0) return null;
                    
                    return (
                      <div key={dept}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                          <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>inventory_2</span>
                          <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{dept}</h3>
                          <div style={{ flex: 1, height: '1px', background: 'var(--outline-variant)' }}></div>
                        </div>

                        <div style={{ display: 'grid', gap: '16px' }}>
                          {deptProducts.map(product => (
                            <div key={product.id} style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--lg-radius)', overflow: 'hidden' }}>
                              <div style={{ padding: '16px 24px', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <img src={product.image} style={{ width: '40px', height: '40px', objectFit: 'contain' }} alt={product.model} />
                                <h4 style={{ fontFamily: 'var(--font-headline)', fontSize: '1rem', fontWeight: 800, margin: 0 }}>{product.brand} {product.model}</h4>
                                <span className="badge" style={{ marginLeft: 'auto', background: 'var(--surface-container-highest)', color: 'var(--on-surface)' }}>{product.stock.length} unidades</span>
                              </div>

                              <div className="device-list" style={{ padding: '8px' }}>
                                {product.stock.length === 0 ? (
                                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>Aún no hay unidades registradas.</div>
                                ) : (
                                  product.stock.map(item => (
                                    <div key={item.id} className="device-item" style={{ background: 'transparent' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                        <span style={{ fontWeight: 800 }}>{item.specificModel}</span>
                                        {dept === 'Celulares' && (
                                          <span style={{ color: 'var(--tertiary)', fontWeight: 800 }}>{item.battery}%</span>
                                        )}
                                        <div className={`device-grade grade-${item.grade.replace(/\s+/g, '-').toLowerCase()}`} style={{ border: 'none', background: 'var(--surface-container-highest)', color: 'var(--on-surface)' }}>
                                          {item.grade}
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {/* INLINE PRICE EDITOR */}
                                        {editingPrices[`${product.id}-${item.id}`] !== undefined ? (
                                          <>
                                            <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', fontWeight: 700 }}>RD$</span>
                                            <input
                                              type="number"
                                              value={editingPrices[`${product.id}-${item.id}`]}
                                              onChange={e => setEditingPrices(prev => ({ ...prev, [`${product.id}-${item.id}`]: e.target.value }))}
                                              className="form-input"
                                              style={{ width: '130px', margin: 0, padding: '8px 12px', fontSize: '0.9rem' }}
                                              autoFocus
                                              onKeyDown={e => { if (e.key === 'Enter') handleSavePrice(product.id, item.id); if (e.key === 'Escape') setEditingPrices(prev => { const n={...prev}; delete n[`${product.id}-${item.id}`]; return n; }); }}
                                            />
                                            <button
                                              onClick={() => handleSavePrice(product.id, item.id)}
                                              style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                            >
                                              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>check</span>
                                            </button>
                                            <button
                                              onClick={() => setEditingPrices(prev => { const n={...prev}; delete n[`${product.id}-${item.id}`]; return n; })}
                                              style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface)', border: 'none', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                            >
                                              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>close</span>
                                            </button>
                                          </>
                                        ) : (
                                          <>
                                            <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--primary)' }}>RD$ {item.price.toLocaleString()}</span>
                                            <button
                                              onClick={() => setEditingPrices(prev => ({ ...prev, [`${product.id}-${item.id}`]: item.price }))}
                                              style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                                              title="Editar precio"
                                            >
                                              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>edit</span>
                                            </button>
                                          </>
                                        )}
                                        <button onClick={() => handleDeleteStock(product.id, item.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex' }}>
                                          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>delete</span>
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* FALLBACK: UNCLASSIFIED STOCK */}
                  {(() => {
                    const classifiedIds = new Set();
                    departments.forEach(dept => {
                      products.filter(p => (p.department || 'Celulares') === dept).forEach(p => classifiedIds.add(p.id));
                    });
                    const unclassified = products.filter(p => !classifiedIds.has(p.id));
                    if (unclassified.length === 0) return null;

                    return (
                      <div style={{ marginTop: '48px', opacity: 0.8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                          <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)' }}>help</span>
                          <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--on-surface-variant)' }}>Otros Equipos (Sin Clasificar)</h3>
                          <div style={{ flex: 1, height: '1px', background: 'var(--outline-variant)' }}></div>
                        </div>
                        <div style={{ display: 'grid', gap: '16px' }}>
                          {unclassified.map(product => (
                            <div key={product.id} style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--lg-radius)', overflow: 'hidden' }}>
                              {/* Same structure as above for unclassified */}
                              <div style={{ padding: '16px 24px', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <img src={product.image} style={{ width: '40px', height: '40px', objectFit: 'contain' }} alt={product.model} />
                                <h4 style={{ fontFamily: 'var(--font-headline)', fontSize: '1rem', fontWeight: 800, margin: 0 }}>{product.brand} {product.model}</h4>
                                <span className="badge" style={{ marginLeft: 'auto', background: 'var(--surface-container-highest)' }}>{product.stock.length} unidades</span>
                              </div>
                              <div className="device-list" style={{ padding: '8px' }}>
                                {product.stock.map(item => (
                                  <div key={item.id} className="device-item" style={{ background: 'transparent' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                      <span style={{ fontWeight: 800 }}>{item.specificModel}</span>
                                      <div className={`device-grade grade-${item.grade.replace(/\s+/g, '-').toLowerCase()}`} style={{ border: 'none', background: 'var(--surface-container-highest)' }}>
                                        {item.grade}
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                      <span style={{ fontWeight: 900, color: 'var(--primary)' }}>RD$ {item.price.toLocaleString()}</span>
                                      <button onClick={() => handleDeleteStock(product.id, item.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>delete</span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
            </>
          )}
        </div>
      )}

      {/* ===== OFFERS / CAMPAIGNS TAB ===== */}
      {activeTab === 'offers' && (
        <div style={{ display: 'grid', gap: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', letterSpacing: '-1px', margin: 0 }}>Campañas Activas</h2>
              <p style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>Estrategias promocionales y eventos curados.</p>
            </div>
            <button className="btn" onClick={() => setShowOfferModal(true)}>
              <span className="material-symbols-outlined">campaign</span>
              Nueva Campaña
            </button>
          </div>

          {offers.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', background: 'var(--surface-container-low)', borderRadius: 'var(--xl-radius)', border: '2px dashed var(--outline-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--on-surface-variant)', marginBottom: '16px' }}>celebration</span>
              <p style={{ color: 'var(--on-surface-variant)' }}>No hay campañas activas en este momento.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '32px' }}>
              {offers.map(offer => {
                const live = isOfferLive(offer);
                return (
                  <div key={offer.id} style={{ 
                    background: 'var(--surface-container-low)', 
                    borderRadius: 'var(--xl-radius)', 
                    overflow: 'hidden',
                    border: live ? `2px solid ${offer.accentColor || 'var(--primary)'}` : '2px solid transparent'
                  }}>
                    <div style={{ background: offer.bgColor || 'var(--surface-container)', padding: '32px', position: 'relative', overflow: 'hidden' }}>
                      {offer.image && (
                        <img src={offer.image} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }} alt="" />
                      )}
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>{offer.emoji}</span>
                        <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{offer.name}</h3>
                        {offer.discount > 0 && (
                          <div style={{ display: 'inline-block', background: offer.accentColor || 'var(--primary)', color: 'black', padding: '4px 12px', borderRadius: '100px', fontWeight: 900, fontSize: '0.9rem', marginTop: '8px' }}>
                            {offer.discount}% OFF
                          </div>
                        )}
                      </div>
                      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                        <span style={{ 
                          background: live ? 'var(--tertiary)' : 'var(--surface-container-highest)', 
                          color: live ? 'black' : 'var(--on-surface)',
                          padding: '4px 12px', 
                          borderRadius: '100px', 
                          fontSize: '0.7rem', 
                          fontWeight: 900 
                        }}>
                          {live ? 'EN VIVO' : 'PAUSADO'}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: '24px' }}>
                      <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', marginBottom: '24px' }}>{offer.description}</p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => handleToggleOffer(offer)} className="btn btn-outline" style={{ flex: 1 }}>
                          {offer.active ? 'Pausar' : 'Reactivar'}
                        </button>
                        <button onClick={() => deleteOffer(offer.id)} style={{ background: 'var(--surface-container-highest)', border: 'none', color: 'var(--error)', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>delete</span>
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
        <div style={{ position: 'fixed', inset: 0, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(12px)' }}>
          <div style={{ background: 'var(--surface-container-high)', borderRadius: 'var(--xl-radius)', padding: '48px', width: '90%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '32px', letterSpacing: '-0.5px' }}>Ingresar Nuevo Stock</h2>
            <form onSubmit={handleAddStock} style={{ display: 'grid', gap: '24px' }}>
              <div>
                <label className="form-label">Marca / Familia Core</label>
                <select className="form-input" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                  <option value="">-- Elige la Familia --</option>
                  {departments.map(dept => {
                    const deptProducts = products.filter(p => (p.department || 'Celulares') === dept);
                    if (deptProducts.length === 0) return null;
                    return (
                      <optgroup key={dept} label={dept.toUpperCase()} style={{ background: 'var(--surface-container-high)' }}>
                        {deptProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.brand} {p.model}</option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>
              
              <div>
                <label className="form-label">Modelo Detallado (Ej: iPhone 15 Pro Max 1TB)</label>
                <input type="text" required placeholder="Especificaciones exactas..." value={newStock.specificModel} onChange={e => setNewStock({ ...newStock, specificModel: e.target.value })} className="form-input" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label className="form-label">Condición Estética</label>
                  <select value={newStock.grade} onChange={e => setNewStock({ ...newStock, grade: e.target.value })} className="form-input">
                    <option value="A">Grado A</option>
                    <option value="B">Grado B</option>
                    <option value="C">Grado C</option>
                    <option value="Nuevo">✨ Nuevo</option>
                    <option value="Como nuevo">💎 Como nuevo</option>
                    <option value="Certificados">✅ Certificado</option>
                    <option value="Open Box">📦 Open Box</option>
                  </select>
                </div>
                {selectedProduct && products.find(p => p.id === selectedProduct)?.department === 'Celulares' && (
                  <div>
                    <label className="form-label">Salud de Batería (%)</label>
                    <input type="number" min="1" max="100" required value={newStock.battery} onChange={e => setNewStock({ ...newStock, battery: e.target.value })} className="form-input" />
                  </div>
                )}
              </div>

              <div>
                <label className="form-label">Precio Final (RD$)</label>
                <input type="number" required placeholder="Ej: 35000" value={newStock.price} onChange={e => setNewStock({ ...newStock, price: e.target.value })} className="form-input" />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button type="submit" className="btn" style={{ flex: 1 }} disabled={!selectedProduct}>
                  Publicar en Inventario
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowStockModal(false)}>
                  Descartar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: PRODUCT FAMILY (ADD/EDIT) ===== */}
      {showProductModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(12px)' }}>
          <div style={{ background: 'var(--surface-container-high)', borderRadius: 'var(--xl-radius)', padding: '48px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <form onSubmit={handleCreateProduct} style={{ display: 'grid', gap: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>
                {editingProduct ? 'Redefinir Familia' : 'Curar Nueva Familia'}
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label className="form-label">Marca (Ej: Samsung)</label>
                  <input name="brand" className="form-input" defaultValue={editingProduct?.brand || ''} required />
                </div>
                <div>
                  <label className="form-label">Línea (Ej: Galaxy S24)</label>
                  <input name="model" className="form-input" defaultValue={editingProduct?.model || ''} required />
                </div>
              </div>
              
              <div>
                <label className="form-label">Departamento Editorial</label>
                <select name="department" className="form-input" defaultValue={editingProduct?.department || departments[0] || ''}>
                  <option value="">-- Selecciona --</option>
                  {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  <option value="otro">+ Crear Nuevo Departamento</option>
                </select>
              </div>

              <div>
                <label className="form-label">Descripción de Marketing</label>
                <textarea name="description" className="form-input" defaultValue={editingProduct?.description || ''} rows="3" />
              </div>
              
              <ImageInput 
                label="Imagen de Presentación" 
                name="image" 
                value={editingProduct?.image || ''} 
                onUpload={(e) => handleFileUpload(e, 'image', false, (base64) => {
                  const input = e.target.closest('form').querySelector('input[name="image"]');
                  if (input) input.value = base64;
                })} 
              />

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button type="submit" className="btn" style={{ flex: 2 }}>
                  {editingProduct ? 'Guardar Redefinición' : 'Publicar Familia'}
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setShowProductModal(false); setEditingProduct(null); }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: NEW OFFER ===== */}
      {showOfferModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(12px)' }}>
          <div style={{ background: 'var(--surface-container-high)', borderRadius: 'var(--xl-radius)', padding: '48px', width: '90%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>Crear Evento Comercial</h2>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '32px' }}>Diseña una campaña de temporada para cautivar al cliente.</p>
            
            {/* Templates */}
            <div style={{ marginBottom: '32px' }}>
              <label className="form-label">Plantillas Editoriales</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {OFFER_TEMPLATES.map(tpl => (
                  <button key={tpl.name} type="button" onClick={() => handleApplyTemplate(tpl)}
                    style={{ background: tpl.color, border: `1px solid ${tpl.accentColor}`, borderRadius: '100px', color: 'white', padding: '8px 20px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 900, transition: 'var(--transition)' }}>
                    {tpl.emoji} {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveOffer} style={{ display: 'grid', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '24px' }}>
                <div><label className="form-label">Símbolo</label><input type="text" value={newOffer.emoji} onChange={e => setNewOffer({ ...newOffer, emoji: e.target.value })} className="form-input" style={{ textAlign: 'center', fontSize: '2rem', height: '100%' }} maxLength="4" /></div>
                <div><label className="form-label">Título del Evento</label><input type="text" required placeholder="Ej: Tech Week 2026" value={newOffer.name} onChange={e => setNewOffer({ ...newOffer, name: e.target.value })} className="form-input" /></div>
              </div>
              
              <div><label className="form-label">Copia Promocional</label><textarea rows="3" placeholder="Describe el beneficio principal de esta campaña..." value={newOffer.description} onChange={e => setNewOffer({ ...newOffer, description: e.target.value })} className="form-input" /></div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '24px' }}>
                <div><label className="form-label">% Off</label><input type="number" min="0" max="99" value={newOffer.discount} onChange={e => setNewOffer({ ...newOffer, discount: e.target.value })} className="form-input" /></div>
                <div><label className="form-label">Apertura</label><input type="date" value={newOffer.startDate} onChange={e => setNewOffer({ ...newOffer, startDate: e.target.value })} className="form-input" /></div>
                <div><label className="form-label">Cierre</label><input type="date" value={newOffer.endDate} onChange={e => setNewOffer({ ...newOffer, endDate: e.target.value })} className="form-input" /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: 'var(--surface-container)', padding: '24px', borderRadius: 'var(--lg-radius)' }}>
                  <label className="form-label">Paleta Base</label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <input type="color" value={newOffer.bgColor} onChange={e => setNewOffer({ ...newOffer, bgColor: e.target.value })} style={{ width: '48px', height: '48px', border: 'none', borderRadius: '100px', cursor: 'pointer', background: 'transparent' }} />
                    <input type="text" value={newOffer.bgColor} onChange={e => setNewOffer({ ...newOffer, bgColor: e.target.value })} className="form-input" style={{ margin: 0 }} />
                  </div>
                </div>
                <div style={{ background: 'var(--surface-container)', padding: '24px', borderRadius: 'var(--lg-radius)' }}>
                  <label className="form-label">Paleta Acento</label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <input type="color" value={newOffer.accentColor} onChange={e => setNewOffer({ ...newOffer, accentColor: e.target.value })} style={{ width: '48px', height: '48px', border: 'none', borderRadius: '100px', cursor: 'pointer', background: 'transparent' }} />
                    <input type="text" value={newOffer.accentColor} onChange={e => setNewOffer({ ...newOffer, accentColor: e.target.value })} className="form-input" style={{ margin: 0 }} />
                  </div>
                </div>
              </div>

              <ImageInput 
                label="Imagen Atmosférica (Opcional)" 
                name="offerImage" 
                value={newOffer.image} 
                onChange={(e) => setNewOffer({ ...newOffer, image: e.target.value })} 
                onUpload={(e) => handleFileUpload(e, 'image', false, (base64) => setNewOffer({ ...newOffer, image: base64 }))}
              />

              <div style={{ background: 'var(--surface-container-highest)', padding: '32px', borderRadius: 'var(--lg-radius)', marginTop: '16px' }}>
                <label className="form-label">Vista Previa Editorial</label>
                <div style={{ background: newOffer.bgColor, borderRadius: 'var(--md-radius)', padding: '24px', display: 'flex', alignItems: 'center', gap: '24px', border: `2px solid ${newOffer.accentColor}` }}>
                  <span style={{ fontSize: '3rem' }}>{newOffer.emoji}</span>
                  <div>
                    <div style={{ color: 'white', fontWeight: 900, fontSize: '1.2rem', fontFamily: 'var(--font-headline)' }}>{newOffer.name || 'Sin título'}</div>
                    {newOffer.discount > 0 && <div style={{ color: newOffer.accentColor, fontWeight: 900 }}>{newOffer.discount}% EXCLUSIVO</div>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button type="submit" className="btn" style={{ flex: 2 }}>🚀 Lanzar Campaña</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setShowOfferModal(false); setNewOffer(emptyOffer); }}>Descartar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== USERS TAB ===== */}
      {activeTab === 'users' && (
        <div style={{ display: 'grid', gap: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', letterSpacing: '-1px' }}>Equipo de Gestión</h2>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {users.length === 0 ? (
              <div style={{ padding: '80px', textAlign: 'center', background: 'var(--surface-container-low)', borderRadius: 'var(--xl-radius)' }}>
                <p style={{ color: 'var(--on-surface-variant)' }}>No hay usuarios registrados aún.</p>
              </div>
            ) : (
              users.map(user => {
                const isTargetSuper = user.email === 'elchelpo2325@gmail.com';
                return (
                  <div key={user.id} style={{ 
                    background: 'var(--surface-container-low)', 
                    padding: '24px 32px', 
                    borderRadius: 'var(--lg-radius)', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    gap: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ 
                        width: '56px', 
                        height: '56px', 
                        borderRadius: '100px', 
                        background: isTargetSuper ? 'var(--tertiary)' : 'var(--primary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'black', 
                        fontWeight: 900, 
                        fontSize: '1.2rem' 
                      }}>
                        {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                          {user.name || 'Sin nombre'} {isTargetSuper && <span style={{ color: 'var(--tertiary)', fontSize: '0.7rem', verticalAlign: 'middle', marginLeft: '8px' }}>SUPER</span>}
                        </h4>
                        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', margin: '4px 0 12px' }}>{user.email}</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ 
                            fontSize: '0.65rem', 
                            padding: '4px 12px', 
                            borderRadius: '100px', 
                            background: user.status === 'approved' ? 'rgba(0, 255, 135, 0.1)' : 'rgba(255, 78, 107, 0.1)', 
                            color: user.status === 'approved' ? '#00ff87' : '#ff4e6b',
                            fontWeight: 900,
                            letterSpacing: '0.05em'
                          }}>
                            {user.status?.toUpperCase() || 'PENDING'}
                          </span>
                          <span style={{ 
                            fontSize: '0.65rem', 
                            padding: '4px 12px', 
                            borderRadius: '100px', 
                            background: 'var(--surface-container-highest)', 
                            color: 'var(--on-surface)',
                            fontWeight: 900,
                            letterSpacing: '0.05em'
                          }}>
                            {user.role?.toUpperCase() || 'USER'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {!isTargetSuper ? (
                        <>
                          {isSuperAdmin && (
                            <div style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
                              {user.role === 'admin' ? (
                                <button onClick={() => handleUpdateUserRole(user.id, 'user')} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Quitar Admin</button>
                              ) : (
                                <button onClick={() => handleUpdateUserRole(user.id, 'admin')} className="btn" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Hacer Admin</button>
                              )}
                            </div>
                          )}
                          
                          {user.status !== 'approved' && (
                            <button onClick={() => handleUpdateUserStatus(user.id, 'approved')} className="btn" style={{ padding: '8px 24px', fontSize: '0.8rem' }}>Aprobar</button>
                          )}
                          {user.status !== 'rejected' && (
                            <button onClick={() => handleUpdateUserStatus(user.id, 'rejected')} className="btn btn-outline" style={{ padding: '8px 24px', fontSize: '0.8rem', borderColor: 'var(--error)', color: 'var(--error)' }}>Rechazar</button>
                          )}
                          <button onClick={() => handleDeleteUser(user.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </>
                      ) : (
                        <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', fontStyle: 'italic' }}>Cuenta de Sistema</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      {/* ===== CONFIG TAB ===== */}
      {activeTab === 'config' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
          
          {/* PDF Reports Card */}
          <div style={{ background: 'var(--surface-container-low)', padding: '40px', borderRadius: 'var(--xl-radius)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--primary)' }}>picture_as_pdf</span>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Reportes PDF</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', margin: 0 }}>Auditoría de inventario físico.</p>
              </div>
            </div>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Genera un documento PDF detallado con el estado actual de todo el stock, incluyendo grados, salud de batería y precios.
            </p>
            <button className="btn" onClick={handleExportPDF} style={{ marginTop: 'auto', width: '100%' }}>
              <span className="material-symbols-outlined">download</span> 
              Exportar Inventario
            </button>
          </div>

          {/* Backup Management Card */}
          <div style={{ background: 'var(--surface-container-low)', padding: '40px', borderRadius: 'var(--xl-radius)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--tertiary)' }}>database</span>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Backup & Restauración</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', margin: 0 }}>Gestión de datos históricos.</p>
              </div>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              <button 
                className="btn btn-outline" 
                onClick={handleExportBackup} 
                style={{ width: '100%' }}
              >
                <span className="material-symbols-outlined">cloud_download</span> Exportar .JSON
              </button>
              
              <div style={{ marginTop: '8px', padding: '16px', background: 'var(--surface-container)', borderRadius: 'var(--md-radius)', border: '1px dashed var(--outline-variant)' }}>
                <label style={{ color: 'var(--on-surface)', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>settings_backup_restore</span> 
                  Restaurar Sistema
                </label>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImportBackup}
                  style={{ width: '100%', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}
                />
              </div>
            </div>
          </div>
          
          {/* Quick Stats Summary */}
          <div style={{ background: 'var(--surface-container-low)', padding: '40px', borderRadius: 'var(--xl-radius)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Estado del Ecosistema</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={statLineStyle}>
                <span style={{ color: 'var(--on-surface-variant)', fontWeight: 600 }}>Total Familias</span>
                <span style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '1.2rem' }}>{products.length}</span>
              </div>
              <div style={statLineStyle}>
                <span style={{ color: 'var(--on-surface-variant)', fontWeight: 600 }}>Unidades en Stock</span>
                <span style={{ color: 'var(--tertiary)', fontWeight: 900, fontSize: '1.2rem' }}>{products.reduce((acc, p) => acc + (p.stock?.length || 0), 0)}</span>
              </div>
              <div style={statLineStyle}>
                <span style={{ color: 'var(--on-surface-variant)', fontWeight: 600 }}>Campañas Activas</span>
                <span style={{ color: 'var(--secondary)', fontWeight: 900, fontSize: '1.2rem' }}>{offers.filter(o => o.active).length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const statLineStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px 0',
  borderBottom: '1px solid rgba(255,255,255,0.05)'
};
