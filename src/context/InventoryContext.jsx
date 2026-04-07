import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch } from "firebase/firestore";
import { db } from "../firebase";

const InventoryContext = createContext();

const defaultSettings = {
  storeName: 'STS | SAILIN TECNO',
  heroBadge: 'Tecnología a tu Alcance',
  heroTitle: 'Sailin Tecno',
  heroTitleHighlight: 'SmartPhone',
  heroDescription: 'Tu destino tecnológico de confianza. Equipos de alta gama, accesorios originales y el mejor servicio técnico garantizado.',
  aboutTitle: 'Nuestra Historia',
  aboutP1: 'Sailin Tecno SmartPhone nació de la pasión por la tecnología y el compromiso de ofrecer lo mejor a nuestra comunidad. No solo vendemos equipos; brindamos la seguridad de adquirir dispositivos certificados con garantía real.',
  aboutP2: 'Somos especialistas en importación directa, lo que nos permite ofrecer precios competitivos sin sacrificar la calidad. Con más de 10 años en el mercado, hemos construido una relación de confianza basada en la transparencia y el servicio técnico de excelencia.',
  stat1Value: '10K+',
  stat1Label: 'Clientes Felices',
  stat2Value: '1 Año',
  stat2Label: 'Garantía Full',
  aboutImage: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
  footerDesc: 'Centro de importación y distribución de dispositivos móviles, inteligente y servicio autorizado.',
  contactAddress: 'STS | SAILIN TECNO SMARTPHONE 8QQ7+9R, Arroyo Hondo 94000',
  contactPhone: '+1 (829) 424-1236',
  contactEmail: 'ventas@sts.com.do',
  socialInstagram: 'https://instagram.com/sailintecno',
  socialFacebook: 'https://facebook.com/sailintecno',
  heroImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  whyUsSectionImage: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
  instagramPhotos: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800',
    'https://images.unsplash.com/photo-1551817958-d194f74d010d?w=800',
    'https://images.unsplash.com/photo-1565849906660-496662489e27?w=800',
  ],
  whyUsItems: [
    { id: '1', icon: '🔒', title: 'Garantía Real', desc: 'Todos nuestros equipos incluyen garantía de 1 año con soporte técnico dedicado.' },
    { id: '2', icon: '✈️', title: 'Importación Directa', desc: 'Traemos equipos originales directamente de fábrica, sin intermediarios.' },
    { id: '3', icon: '💰', title: 'Mejor Precio', desc: 'Precios competitivos y opciones de financiamiento flexible para todos.' },
    { id: '4', icon: '⭐', title: '10 Años de Experiencia', desc: 'Una década atendiendo clientes con honestidad y profesionalismo.' },
  ],
  locationLat: '',
  locationLng: '',
  instagramWidgetCode: '',
  departments: ['Celulares', 'Laptops & Computadoras', 'Tablets', 'Smartwatches', 'TV & Entretenimiento', 'Accesorios', 'Camaras']
};

export function InventoryProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState(defaultSettings.departments);

  useEffect(() => {
    // Suscripción en Tiempo Real a Settings
    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.storeName === 'MovilTech' || data.storeName === 'Capital Celular' || data.storeName === 'Sailin Tecno SmartPhone') {
          console.log("Migración de marca detectada: Actualizando metadatos base...");
          // Solo actualizamos lo NO estructural para no borrar departamentos del usuario
          const { departments, ...restDefault } = defaultSettings;
          setDoc(doc(db, "settings", "global"), restDefault, { merge: true });
        }
        setSettings(prev => ({ 
          ...defaultSettings, 
          ...data
        }));
        if (data.departments) {
          setDepartments(data.departments);
        }
      } else {
        setDoc(doc(db, "settings", "global"), defaultSettings);
      }
    }, (error) => {
      console.warn("Error leyendo settings de Firebase. Operando con fallback.", error);
    });

    // Suscripción en Tiempo Real a Categorías/Modelos
    const unsubProducts = onSnapshot(collection(db, "categories"), (snapshot) => {
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setProducts(items);
      setLoading(false);
    }, (error) => {
      console.warn("Error leyendo categorías de Firebase. ¿Reglas de acceso configuradas?", error);
      setLoading(false);
    });

    // Suscripción en Tiempo Real a Ofertas
    const unsubOffers = onSnapshot(collection(db, "offers"), (snapshot) => {
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setOffers(items);
    }, (error) => {
      console.warn("Error leyendo ofertas de Firebase.", error);
    });

    return () => {
      unsubSettings();
      unsubProducts();
      unsubOffers();
    };
  }, []);

  // Controladores de Productos/Stock (Categorías/Familias)
  const addProduct = async (newProduct) => {
    try {
      const id = newProduct.id || (newProduct.brand.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now());
      await setDoc(doc(db, "categories", id), { ...newProduct, id });
    } catch (e) { console.error("Error guardando nueva marca: ", e); }
  };

  const updateProduct = async (updatedProduct) => {
    try {
      if (!updatedProduct.id) return;
      await setDoc(doc(db, "categories", updatedProduct.id), updatedProduct);
    } catch (e) { console.error("Error al actualizar marca/stock: ", e); }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "categories", id));
    } catch (e) { console.error("Error eliminando categoría: ", e); }
  };

  // Controladores de Settings
  const updateSettings = async (newSettings) => {
    try {
      await setDoc(doc(db, "settings", "global"), newSettings);
    } catch (e) { console.error("Error guardando ajustes web: ", e); }
  };

  const updateDepartments = async (newDepts) => {
    try {
      await setDoc(doc(db, "settings", "global"), { departments: newDepts }, { merge: true });
      setDepartments(newDepts);
    } catch (e) {
      console.error("Error guardando departamentos: ", e);
    }
  };

  // Controladores de Ofertas/Campañas
  const addOffer = async (offer) => {
    try {
      const id = 'offer-' + Date.now();
      await setDoc(doc(db, "offers", id), { ...offer, id });
    } catch (e) { console.error("Error creando oferta: ", e); }
  };

  const updateOffer = async (offer) => {
    try {
      await setDoc(doc(db, "offers", offer.id), offer);
    } catch (e) { console.error("Error actualizando oferta: ", e); }
  };

  const deleteOffer = async (id) => {
    try {
      await deleteDoc(doc(db, "offers", id));
    } catch (e) { console.error("Error eliminando oferta: ", e); }
  };

  const restoreBackup = async (backupData) => {
    try {
      const batch = writeBatch(db);

      // Restore Settings
      if (backupData.settings) {
        batch.set(doc(db, "settings", "global"), backupData.settings);
      }

      // Restore Categories (Products)
      if (backupData.categories && Array.isArray(backupData.categories)) {
        backupData.categories.forEach(cat => {
          batch.set(doc(db, "categories", cat.id), cat);
        });
      }

      // Restore Offers
      if (backupData.offers && Array.isArray(backupData.offers)) {
        backupData.offers.forEach(off => {
          batch.set(doc(db, "offers", off.id), off);
        });
      }

      await batch.commit();
      return true;
    } catch (e) {
      console.error("Error al restaurar backup: ", e);
      return false;
    }
  };

  return (
    <InventoryContext.Provider value={{ 
      products, addProduct, updateProduct, deleteProduct,
      settings, updateSettings, loading,
      offers, addOffer, updateOffer, deleteOffer,
      departments, updateDepartments,
      restoreBackup
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => useContext(InventoryContext);

