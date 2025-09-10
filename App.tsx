import React, { useState, useMemo, useEffect } from 'react';
import { Product, Slide, FaqItem, CartItem, InfoFeature } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import InfoSection from './components/InfoSection';
import CategoryFilter from './components/CategoryFilter';
import ProductGrid from './components/ProductGrid';
import ProductDetail from './components/ProductDetail';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import CartModal from './components/CartModal';

declare global {
    interface Window {
        netlifyIdentity: any;
    }
}

const initialInfoFeatures: InfoFeature[] = [
  { icon: '🌿', title: '100% Orgánico', description: 'Elaborado con los mejores ingredientes naturales.' },
  { icon: '🐰', title: 'Libre de Crueldad', description: 'Nunca probamos en animales.' },
  { icon: '🌎', title: 'Ecológico', description: 'Embalaje sostenible para un planeta más feliz.' },
  { icon: '💖', title: 'Hecho con Amor', description: 'Cada producto es un testimonio de nuestra pasión.' },
];

function App() {
  // CMS Content State
  const [products, setProducts] = useState<Product[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [settings, setSettings] = useState({ siteName: 'Makeup Glamours', logo: '', phoneNumber: '', sliderSpeed: 5000 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local storage state
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>('cart', []);
  
  // View state
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Modal state
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // UI state
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    // Initialize Netlify Identity
    if (window.netlifyIdentity) {
      window.netlifyIdentity.init();
    }

    const fetchContent = async () => {
      try {
        const [settingsRes, heroRes, productsRes, faqsRes] = await Promise.all([
          fetch('/content/settings.json'),
          fetch('/content/hero.json'),
          fetch('/content/products.json'),
          fetch('/content/faqs.json'),
        ]);

        if (!settingsRes.ok || !heroRes.ok || !productsRes.ok || !faqsRes.ok) {
          throw new Error('Failed to fetch content');
        }

        const settingsData = await settingsRes.json();
        const heroData = await heroRes.json();
        const productsData = await productsRes.json();
        const faqsData = await faqsRes.json();

        setSettings(settingsData);
        setSlides(heroData.slides.map((s: any, i: number) => ({...s, id: s.id || i + 1})));
        setProducts(productsData.products.map((p: any, i: number) => ({
          ...p,
          id: p.id || i + 1,
          images: p.images.map((img: any) => typeof img === 'string' ? img : img.image).filter(Boolean)
        })));
        setFaqs(faqsData.faqs.map((f: any, i: number) => ({...f, id: f.id || i + 1})));
        
      } catch (err) {
        setError('No se pudo cargar el contenido del sitio. Por favor, inténtalo de nuevo más tarde.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => selectedCategory === 'Todos' || p.category === selectedCategory)
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, selectedCategory, searchQuery]);
  
  const cartItemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);
  
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    if (product.stock <= 0) return;
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };
  
  const handleUpdateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCartItems(prev =>
        prev.map(item => (item.id === productId ? { ...item, quantity } : item))
      );
    }
  };
  
  const handleRemoveFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="text-center p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Ocurrió un Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 text-gray-800">
      <Header
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
        isScrolled={isScrolled}
        siteName={settings.siteName}
        logoDataUri={settings.logo}
        isProductPage={!!selectedProduct}
      />

      <main>
        {selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
          />
        ) : (
          <>
            <HeroSlider 
              slides={slides} 
              sliderSpeed={settings.sliderSpeed}
            />
            <InfoSection features={initialInfoFeatures} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="text-center mb-12 animate-fade-in-up">
                <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-800">Catálogo</h2>
              </div>
              <CategoryFilter
                categories={['Todos', ...new Set(products.map(p => p.category))]}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
              <ProductGrid 
                products={filteredProducts} 
                onProductClick={setSelectedProduct} 
                onAddToCart={handleAddToCart}
              />
            </div>
            <FaqSection faqs={faqs} />
          </>
        )}
      </main>

      <Footer siteName={settings.siteName} logoDataUri={settings.logo} phoneNumber={settings.phoneNumber} />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        phoneNumber={settings.phoneNumber}
      />
    </div>
  );
}

export default App;