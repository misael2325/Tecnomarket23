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
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px', fontSize: '0.9rem' }}>{label}</label>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="url" 
          name={name} 
          value={value || ''} 
          onChange={onChange} 
          style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }} 
          placeholder={placeholder || "https://..."} 
        />
        <label style={{ 
          background: 'var(--primary)', 
          color: 'black', 
          padding: '10px 15px', 
          borderRadius: '8px', 
          cursor: 'pointer', 
          fontWeight: 700, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px',
          whiteSpace: 'nowrap'
        }}>
          <span className="material-icons" style={{ fontSize: '1.2rem' }}>upload</span>
          Subir
          <input type="file" accept="image/*" onChange={onUpload} style={{ display: 'none' }} />
        </label>
      </div>
      {value && (
        <img src={value} alt="Preview" style={{ marginTop: '10px', width: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }} />
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
      await updateProduct(editingProduct.id, newProduct);
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
          { key: 'stock',    label: '📦 Equipos en Stock' },
          { key: 'offers',   label: '🎉 Campañas' },
          { key: 'users',    label: '👥 Usuarios' },
          { key: 'config',   label: '⚙️ Configuración' },
        ].filter(tab => (tab.key !== 'users' && tab.key !== 'config') || isSuperAdmin).map(tab => (
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
              <ImageInput 
                label="🖼️ Imagen de Fondo del Banner (Hero)" 
                name="heroImage" 
                value={localSettings.heroImage} 
                onChange={handleSettingsChange} 
                onUpload={(e) => handleFileUpload(e, 'heroImage')}
              />
              <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Descripción del Banner</label><textarea name="heroDescription" value={localSettings.heroDescription || ''} onChange={handleSettingsChange} rows="2" style={inputStyle} /></div>
            </div>
          </div>

          {/* Acerca de */}
          <div style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '15px', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}><span className="material-icons">info</span>Sección "Acerca de" (Nosotros)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Título de la Sección</label><input type="text" name="aboutTitle" value={localSettings.aboutTitle || ''} onChange={handleSettingsChange} style={inputStyle} /></div>
              <div><label style={labelStyle}>Párrafo 1 (Descriptivo)</label><textarea name="aboutP1" value={localSettings.aboutP1 || ''} onChange={handleSettingsChange} rows="3" style={inputStyle} /></div>
              <div><label style={labelStyle}>Párrafo 2 (Historial/Misión)</label><textarea name="aboutP2" value={localSettings.aboutP2 || ''} onChange={handleSettingsChange} rows="3" style={inputStyle} /></div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <ImageInput 
                  label="URL Imagen de la Tienda (Sección 'Acerca de')" 
                  name="aboutImage" 
                  value={localSettings.aboutImage} 
                  onChange={handleSettingsChange} 
                  onUpload={(e) => handleFileUpload(e, 'aboutImage')}
                />
              </div>
            </div>
          </div>

          {/* Estadísticas (opcional, se muestran en Home) */}
          <div style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '15px', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}><span className="material-icons">analytics</span>Estadísticas y Banner Why Us</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div><label style={labelStyle}>Estadística 1 – Valor</label><input type="text" name="stat1Value" value={localSettings.stat1Value || ''} onChange={handleSettingsChange} style={inputStyle} /></div>
              <div><label style={labelStyle}>Estadística 1 – Etiqueta</label><input type="text" name="stat1Label" value={localSettings.stat1Label || ''} onChange={handleSettingsChange} style={inputStyle} /></div>
              <div><label style={labelStyle}>Estadística 2 – Valor</label><input type="text" name="stat2Value" value={localSettings.stat2Value || ''} onChange={handleSettingsChange} style={inputStyle} /></div>
              <div><label style={labelStyle}>Estadística 2 – Etiqueta</label><input type="text" name="stat2Label" value={localSettings.stat2Label || ''} onChange={handleSettingsChange} style={inputStyle} /></div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <ImageInput 
                  label="🖼️ URL Imagen General – sección '¿Por qué elegirnos?' (Banner opcional)" 
                  name="whyUsSectionImage" 
                  value={localSettings.whyUsSectionImage} 
                  onChange={handleSettingsChange} 
                  onUpload={(e) => handleFileUpload(e, 'whyUsSectionImage')}
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '1.3rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>📞 Contacto y Redes Sociales</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={labelStyle}>📧 Correo Electrónico</label>
                <input type="email" name="contactEmail" value={localSettings.contactEmail || ''} onChange={handleSettingsChange} style={inputStyle} placeholder="ventas@capitalcelular.com" />
              </div>
              <div style={{ gridColumn: '1 / -1', padding: '15px', background: 'rgba(0,240,255,0.05)', borderRadius: '12px', border: '1px solid rgba(0,240,255,0.2)', marginBottom: '10px' }}>
                <h4 style={{ color: 'var(--primary)', margin: '0 0 10px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-icons">my_location</span> Ubicación Precisa (Coordenadas)
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '15px' }}>
                  ¿Tu local no aparece en el mapa? Haz clic derecho en Google Maps sobre tu puerta y copia las coordenadas (Ej: 18.4861, -69.9312).
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '0.8rem' }}>Latitud</label>
                    <input type="text" name="locationLat" value={localSettings.locationLat || ''} onChange={handleSettingsChange} placeholder="Ej: 18.4861" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '0.8rem' }}>Longitud</label>
                    <input type="text" name="locationLng" value={localSettings.locationLng || ''} onChange={handleSettingsChange} placeholder="Ej: -69.9312" style={inputStyle} />
                  </div>
                </div>
              </div>
              <div>
                <label style={labelStyle}>📸 Enlace de Instagram</label>
                <input type="url" name="socialInstagram" value={localSettings.socialInstagram || ''} onChange={handleSettingsChange} style={inputStyle} placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label style={labelStyle}>🔵 Enlace de Facebook</label>
                <input type="url" name="socialFacebook" value={localSettings.socialFacebook || ''} onChange={handleSettingsChange} style={inputStyle} placeholder="https://facebook.com/..." />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Descripción en el Footer</label>
                <textarea name="footerDesc" value={localSettings.footerDesc || ''} onChange={handleSettingsChange} rows="2" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Instagram Feed Editor */}
          <div style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '15px', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-icons">instagram</span> Publicidad: Fotos de Instagram (Feed Preview)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Selecciona hasta 4 fotos recientes para mostrar en la página de inicio como publicidad.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx}>
                  <ImageInput 
                    label={`Foto ${idx + 1}`} 
                    name={`ig-${idx}`} 
                    value={localSettings.instagramPhotos?.[idx] || ''} 
                    onChange={(e) => handleInstagramPhotoChange(idx, e.target.value)} 
                    onUpload={(e) => handleFileUpload(e, `ig-${idx}`, false, (base64) => handleInstagramPhotoChange(idx, base64))}
                  />
                </div>
              ))}
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

      {activeTab === 'models' && (
        <div>
          {/* GESTIÓN DE DEPARTAMENTOS */}
          <div style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '15px', border: '1px solid var(--glass-border)', marginBottom: '30px' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-icons">category</span> Gestión de Departamentos
            </h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Nuevo departamento (ej: Andadores)" 
                value={newDepartment} 
                onChange={e => setNewDepartment(e.target.value.trim())} 
                style={{ flex: 1, minWidth: '250px', ...inputStyle }} 
              />
              <button 
                className="btn" 
                onClick={() => {
                  if (newDepartment && !departments.includes(newDepartment)) {
                    updateDepartments([...departments, newDepartment]);
                    setNewDepartment('');
                  }
                }} 
                disabled={!newDepartment || departments.includes(newDepartment)}
              >
                <span className="material-icons">add</span> Agregar
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {departments.map((dept, index) => (
                <div key={dept} style={{ 
                  background: editingDepartmentIndex === index ? 'rgba(0,240,255,0.1)' : 'rgba(255,255,255,0.05)', 
                  padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--glass-border)',
                  display: 'flex', alignItems: 'center', gap: '8px' 
                }}>
                  {editingDepartmentIndex === index ? (
                    <>
                      <input 
                        value={tempDepartmentName} 
                        onChange={e => setTempDepartmentName(e.target.value)} 
                        style={{ background: 'transparent', border: 'none', color: 'white', width: '120px', fontSize: '0.9rem' }} 
                        autoFocus 
                      />
                      <button onClick={() => {
                        const newDepts = [...departments];
                        newDepts[index] = tempDepartmentName.trim();
                        updateDepartments(newDepts.filter(d => d.trim()));
                        setEditingDepartmentIndex(-1);
                        setTempDepartmentName('');
                      }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                        <span className="material-icons">check</span>
                      </button>
                      <button onClick={() => {
                        setEditingDepartmentIndex(-1);
                        setTempDepartmentName('');
                      }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <span className="material-icons">close</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ fontWeight: 500, color: 'white' }}>{dept}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          onClick={() => {
                            setEditingDepartmentIndex(index);
                            setTempDepartmentName(dept);
                          }} 
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, width: '24px', height: '24px' }}
                          title="Editar"
                        >
                          <span className="material-icons" style={{ fontSize: '1rem' }}>edit</span>
                        </button>
                        <button 
                          onClick={() => updateDepartments(departments.filter((_, i) => i !== index))} 
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, width: '24px', height: '24px' }}
                          title="Eliminar"
                        >
                          <span className="material-icons" style={{ fontSize: '1rem' }}>delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            {departments.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>No hay departamentos. Agrega el primero para organizar tus marcas.</p>
            )}
          </div>

          <button className="btn" onClick={() => { setEditingProduct(null); setShowProductModal(true); }} style={{ marginBottom: '20px' }}>
            <span className="material-icons">add</span> Crear Nueva Marca o Categoría
          </button>
          
          {/* FAMILIES / CATEGORIES SECTION */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
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
                <span className="material-icons">add</span> Ingresar Equipo Nuevo
              </button>
              <div style={{ display: 'grid', gap: '40px' }}>
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
                           dept === 'TV & Entretenimiento' ? 'tv' : 'category'}
                        </span>
                        {dept}
                      </h3>
                      <div style={{ display: 'grid', gap: '20px' }}>
                        {deptProducts.map(product => (
                          <div key={product.id} className="device-list" style={{ marginTop: 0, background: 'var(--bg-card)', borderRadius: '15px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                            <div style={{ padding: '15px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                              <img src={product.image} style={{ width: '35px', height: '35px', objectFit: 'contain', borderRadius: '6px', background: '#111' }} alt={product.model} />
                              <div>
                                <h4 style={{ color: 'white', margin: 0, fontSize: '1.1rem' }}>{product.brand} - {product.model}</h4>
                                <span className="stock-badge" style={{ marginLeft: 0, background: 'rgba(0, 240, 255, 0.1)', color: 'var(--primary)', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75em' }}>Inventory: {product.stock.length} unds</span>
                              </div>
                            </div>
                            {product.stock.length === 0 ? (
                              <div style={{ padding: '15px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>Sin equipos ingresados aún.</div>
                            ) : (
                              product.stock.map(item => (
                                <div key={item.id} className="device-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid var(--glass-border)', flexWrap: 'wrap', gap: '10px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <span style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{item.specificModel}</span>
                                    <span className={`device-grade grade-${item.grade.toLowerCase()}`} style={{ fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', border: '1px solid currentColor', fontSize: '0.75rem' }}>Grado {item.grade}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Bat: {item.battery}%</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <span style={{ fontWeight: 600, color: 'white', fontSize: '0.95rem' }}>RD$ {item.price.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
                                    <button className="action-btn delete-btn" onClick={() => handleDeleteStock(product.id, item.id)} title="Vendido/Eliminar" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                      <span className="material-icons" style={{ color: '#ef4444', fontSize: '1.2rem' }}>delete</span>
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
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
                    <div style={{ background: offer.bgColor || 'var(--bg-card)', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', position: 'relative' }}>
                      {offer.image && (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.15, pointerEvents: 'none' }}>
                          <img src={offer.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="bg" />
                        </div>
                      )}
                      <span style={{ fontSize: '2.5rem', zIndex: 1 }}>{offer.emoji}</span>
                      <div style={{ flex: 1, zIndex: 1 }}>
                        <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>{offer.name}</h3>
                        {offer.discount > 0 && <span style={{ color: offer.accentColor || '#00f0ff', fontWeight: 700, fontSize: '1.1rem' }}>{offer.discount}% OFF</span>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 1 }}>
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
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Registrar Nuevo Equipo</h2>
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
                {/* Battery - Only show for battery-operated devices */}
                {selectedProduct && !['TV & Entretenimiento', 'Accesorios'].includes(products.find(p => p.id === selectedProduct)?.department) && (
                  <div>
                    <label style={labelStyle}>🔋 Condición de Batería (%)</label>
                    <input type="number" min="1" max="100" required value={newStock.battery} onChange={e => setNewStock({ ...newStock, battery: e.target.value })} style={inputStyle} placeholder="Ej: 95" />
                  </div>
                )}
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

      {/* ===== MODAL: PRODUCT FAMILY (ADD/EDIT) ===== */}
      {showProductModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(5px)' }}>
          <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '15px', padding: '30px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <form onSubmit={handleCreateProduct}>
              <h2 style={{ color: 'white', marginBottom: '20px' }}>{editingProduct ? 'Editar Familia' : 'Nueva Marca o Categoría'}</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label className="form-label">Marca (Ej: Apple)</label>
                  <input name="brand" className="form-input" defaultValue={editingProduct?.brand || ''} required style={{ marginBottom: 0 }} />
                </div>
                <div>
                  <label className="form-label">Nombre Catálogo (Ej: iPhone 15)</label>
                  <input name="model" className="form-input" defaultValue={editingProduct?.model || ''} required style={{ marginBottom: 0 }} />
                </div>
              </div>
              
              <label className="form-label">Departamento</label>
              <div style={{ position: 'relative' }}>
                <select 
                  name="department" 
                  className="form-input" 
                  defaultValue={editingProduct?.department || departments[0] || ''} 
                  style={{ marginBottom: '15px', paddingRight: '100px' }}
                >
                  <option value="">-- Selecciona --</option>
                  {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  <option value="otro">➕ Otro (Nuevo)</option>
                </select>
                <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '5px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>o escribe libre</span>
                </div>
              </div>

              <label className="form-label">Descripción</label>
              <textarea name="description" className="form-input" defaultValue={editingProduct?.description || ''} rows="2" style={{ marginBottom: '15px' }} />
              
              <label className="form-label">Imagen de la Marca</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input 
                  id="modalImageInput" 
                  name="image" 
                  className="form-input" 
                  defaultValue={editingProduct?.image || ''} 
                  style={{ marginBottom: 0, flex: 1 }} 
                  placeholder="URL de imagen..."
                />
                <label style={{ background: 'var(--primary)', color: 'black', padding: '0 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span className="material-icons">upload</span>
                  Subir
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={(e) => handleFileUpload(e, 'image', false, (base64) => {
                      document.getElementById('modalImageInput').value = base64;
                    })} 
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button type="submit" className="btn" style={{ flex: 2 }}>{editingProduct ? 'Guardar Cambios' : 'Crear Registro'}</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setShowProductModal(false); setEditingProduct(null); }}>Cancelar</button>
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

              <div style={{ marginBottom: '20px' }}>
                <ImageInput 
                  label="🖼️ Imagen Publicitaria (Opcional)" 
                  name="offerImage" 
                  value={newOffer.image} 
                  onChange={(e) => setNewOffer({ ...newOffer, image: e.target.value })} 
                  onUpload={(e) => handleFileUpload(e, 'image', false, (base64) => setNewOffer({ ...newOffer, image: base64 }))}
                />
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

      {/* ===== USERS TAB ===== */}
      {activeTab === 'users' && (
        <div>
          <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '1.4rem' }}>Gestión de Usuarios</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {users.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No hay usuarios registrados aún.</p>
            ) : (
              users.map(user => {
                const isTargetSuper = user.email === 'elchelpo2325@gmail.com';
                return (
                  <div key={user.id} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '15px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: isTargetSuper ? '#f59e0b' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 700, fontSize: '1.2rem' }}>
                        {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ color: 'white', margin: 0 }}>{user.name || 'Sin nombre'} {isTargetSuper && <span style={{ color: '#f59e0b', fontSize: '0.7rem' }}>(SUPER)</span>}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{user.email}</p>
                        <span style={{ 
                          display: 'inline-block', 
                          marginTop: '5px', 
                          fontSize: '0.75rem', 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          background: user.status === 'approved' ? '#065f46' : user.status === 'rejected' ? '#881337' : '#92400e',
                          color: 'white',
                          fontWeight: 600
                        }}>
                          {user.status?.toUpperCase() || 'PENDING'}
                        </span>
                        <span style={{ 
                          display: 'inline-block', 
                          marginLeft: '8px', 
                          fontSize: '0.75rem', 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          background: user.role === 'admin' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                          color: user.role === 'admin' ? 'black' : 'white',
                          fontWeight: 700
                        }}>
                          {user.role?.toUpperCase() || 'USER'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {!isTargetSuper ? (
                        <>
                          {/* Role Management (Only for Super Admin) */}
                          {isSuperAdmin && (
                            <div style={{ display: 'flex', gap: '5px', marginRight: '10px', borderRight: '1px solid var(--glass-border)', paddingRight: '10px' }}>
                              {user.role === 'admin' ? (
                                <button onClick={() => handleUpdateUserRole(user.id, 'user')} className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>Quitar Admin</button>
                              ) : (
                                <button onClick={() => handleUpdateUserRole(user.id, 'admin')} className="btn" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>Hacer Admin</button>
                              )}
                            </div>
                          )}
                          
                          {user.status !== 'approved' && (
                            <button onClick={() => handleUpdateUserStatus(user.id, 'approved')} className="btn" style={{ padding: '8px 15px', fontSize: '0.85rem' }}>Aprobar</button>
                          )}
                          {user.status !== 'rejected' && (
                            <button onClick={() => handleUpdateUserStatus(user.id, 'rejected')} className="btn btn-outline" style={{ padding: '8px 15px', fontSize: '0.85rem', border: '1px solid #ef4444', color: '#ef4444' }}>Rechazar</button>
                          )}
                          <button onClick={() => handleDeleteUser(user.id)} style={{ padding: '8px 10px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                            <span className="material-icons">delete</span>
                          </button>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>Cuenta Protegida</span>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          
          {/* PDF Reports Card */}
          <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '15px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span className="material-icons" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>picture_as_pdf</span>
              <div>
                <h3 style={{ color: 'white', margin: 0 }}>Reportes de Inventario</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Genera un listado detallado de todo el stock.</p>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Este documento incluye marca, modelo, condición física (grado), salud de batería y precio de cada unidad en el sistema.
            </p>
            <button className="btn" onClick={handleExportPDF} style={{ marginTop: 'auto' }}>
              <span className="material-icons">download</span> Descargar PDF de Inventario
            </button>
          </div>

          {/* Backup Management Card */}
          <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '15px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span className="material-icons" style={{ fontSize: '2.5rem', color: '#f59e0b' }}>backup</span>
              <div>
                <h3 style={{ color: 'white', margin: 0 }}>Copia de Seguridad</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Resguarda toda tu información fuera de la nube.</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn btn-outline" 
                onClick={handleExportBackup} 
                style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
              >
                <span className="material-icons">cloud_download</span> Exportar Todo (.json)
              </button>
              
              <div style={{ marginTop: '10px', padding: '15px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '10px', border: '1px dashed #f59e0b' }}>
                <label style={{ ...labelStyle, color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span className="material-icons" style={{ fontSize: '1rem' }}>restore</span> Restaurar Backup
                </label>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImportBackup}
                  style={{ ...inputStyle, padding: '5px', fontSize: '0.8rem', background: 'transparent' }}
                />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '10px' }}>
                  ⚠️ Solo usa archivos generados previamente por este sistema.
                </p>
              </div>
            </div>
          </div>
          
          {/* Quick Stats Summary */}
          <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '15px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ color: 'white', margin: 0 }}>Estado del Sistema</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={statLineStyle}>
                <span style={{ color: 'var(--text-muted)' }}>Total Familias:</span>
                <span style={{ color: 'white', fontWeight: 600 }}>{products.length}</span>
              </div>
              <div style={statLineStyle}>
                <span style={{ color: 'var(--text-muted)' }}>Total Unidades:</span>
                <span style={{ color: 'white', fontWeight: 600 }}>{products.reduce((acc, p) => acc + (p.stock?.length || 0), 0)}</span>
              </div>
              <div style={statLineStyle}>
                <span style={{ color: 'var(--text-muted)' }}>Campañas Activas:</span>
                <span style={{ color: 'white', fontWeight: 600 }}>{offers.filter(o => o.active).length}</span>
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
