import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const InventoryContext = createContext();

const defaultSettings = {
  storeName: 'MovilTech',
  heroBadge: 'Catálogo Oficial 2026',
  heroTitle: 'La Capital de los',
  heroTitleHighlight: 'Smartphones',
  heroDescription: 'Descubre la mejor tecnología, dispositivos de gama alta y ofertas exclusivas que no encontrarás en ningún otro lugar.',
  aboutTitle: '¿Por qué elegir MovilTech?',
  aboutP1: 'Somos una tienda especializada en la venta de celulares de gama alta, accesorios y equipos tecnológicos con los precios más competitivos.',
  aboutP2: 'Contamos con más de 10 años de experiencia importando equipos originales y brindando la mejor garantía y servicio técnico.',
  stat1Value: '10K+',
  stat1Label: 'Clientes Felices',
  stat2Value: '1 Año',
  stat2Label: 'Garantía Full',
  aboutImage: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
  footerDesc: 'Centro de importación y distribución de dispositivos móviles, inteligente y servicio autorizado.',
  contactAddress: 'Santo Domingo, República Dominicana',
  contactPhone: '+1 (809) 555-0123',
  whyUsItems: [
    { id: '1', icon: '🔒', title: 'Garantía Real', desc: 'Todos nuestros equipos incluyen garantía de 1 año con soporte técnico dedicado.' },
    { id: '2', icon: '✈️', title: 'Importación Directa', desc: 'Traemos equipos originales directamente de fábrica, sin intermediarios.' },
    { id: '3', icon: '💰', title: 'Mejor Precio', desc: 'Precios competitivos y opciones de financiamiento flexible para todos.' },
    { id: '4', icon: '⭐', title: '10 Años de Experiencia', desc: 'Una década atendiendo clientes con honestidad y profesionalismo.' },
  ]
};

export function InventoryProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Suscripción en Tiempo Real a Settings
    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(prev => ({ ...defaultSettings, ...docSnap.data() }));
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

  // Controladores de Productos/Stock
  const updateProduct = async (updatedProduct) => {
    try {
      await setDoc(doc(db, "categories", updatedProduct.id), updatedProduct);
    } catch (e) { console.error("Error al actualizar unidad física: ", e); }
  };
  
  const addNewModel = async (newModel) => {
    try {
      await setDoc(doc(db, "categories", newModel.id), newModel);
    } catch (e) { console.error("Error guardando nueva marca: ", e); }
  };
  
  const updateModel = async (updatedModel) => {
    try {
      await setDoc(doc(db, "categories", updatedModel.id), updatedModel);
    } catch (e) { console.error("Error actualizando familia: ", e); }
  };

  const deleteModel = async (id) => {
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

  return (
    <InventoryContext.Provider value={{ 
      products, updateProduct, addNewModel, updateModel, deleteModel,
      settings, updateSettings, loading,
      offers, addOffer, updateOffer, deleteOffer
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => useContext(InventoryContext);
