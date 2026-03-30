import React, { createContext, useContext, useState, useEffect } from 'react';

const InventoryContext = createContext();

const defaultSettings = {
  storeName: 'Capital Celular',
  heroBadge: 'Nuevos Modelos 2026',
  heroTitle: 'La Capital de los',
  heroTitleHighlight: 'Smartphones',
  heroDescription: 'Descubre la mejor tecnología, dispositivos de gama alta y ofertas exclusivas que no encontrarás en ningún otro lugar del país.',
  aboutTitle: '¿Por qué elegir Capital Celular?',
  aboutP1: 'Somos una tienda especializada en la venta de celulares de gama alta, accesorios y equipos tecnológicos con los precios más competitivos del mercado en República Dominicana.',
  aboutP2: 'Contamos con más de 10 años de experiencia importando equipos originales y brindando la mejor garantía y servicio técnico a nuestros clientes.',
  stat1Value: '10K+',
  stat1Label: 'Clientes Felices',
  stat2Value: '1 Año',
  stat2Label: 'Garantía Full',
  aboutImage: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
  footerDesc: 'Centro de importación y distribución de dispositivos móviles, accesorios smart y servicio autorizado.',
  contactAddress: 'Av. Winston Churchill, Santo Domingo',
  contactPhone: '+1 (809) 555-0123'
};

const defaultCategories = [
  {
    id: 'apple',
    brand: 'Apple',
    model: 'Catálogo iPhone',
    image: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800&q=80',
    description: 'Toda la linea de dispositivos Apple, desde el iPhone 11 hasta los más recientes modelos Pro Max.',
    basePrice: 15000,
    stock: [] 
  },
  {
    id: 'samsung',
    brand: 'Samsung',
    model: 'Dispositivos Galaxy',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80',
    description: 'La mejor tecnología Android. Series S, Z Fold, Z Flip y familia A disponibles.',
    basePrice: 10000,
    stock: []
  },
  {
    id: 'xiaomi',
    brand: 'Xiaomi',
    model: 'Familia Redmi y Poco',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
    description: 'Calidad y precio insuperable. Rendimiento puro al alcance de tu bolsillo.',
    basePrice: 6000,
    stock: []
  }
];

export function InventoryProvider({ children }) {
  const [products, setProducts] = useState(() => {
    // Use new key to avoid breaking current app DB shapes
    const saved = localStorage.getItem('capital_celular_categories_v2');
    if (saved) return JSON.parse(saved);
    return defaultCategories;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('capital_celular_settings');
    if (saved) return JSON.parse(saved);
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('capital_celular_categories_v2', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('capital_celular_settings', JSON.stringify(settings));
  }, [settings]);

  const updateProduct = (updatedProduct) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };
  
  const addNewModel = (newModel) => {
    setProducts([...products, { ...newModel, stock: [] }]);
  };
  const updateModel = (updatedModel) => {
    setProducts(products.map(p => p.id === updatedModel.id ? updatedModel : p));
  };
  const deleteModel = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
  };

  return (
    <InventoryContext.Provider value={{ 
      products, updateProduct, addNewModel, updateModel, deleteModel,
      settings, updateSettings 
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => useContext(InventoryContext);
