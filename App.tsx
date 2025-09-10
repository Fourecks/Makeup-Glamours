import React, { useState, useMemo, useEffect } from 'react';
import netlifyIdentity from 'netlify-identity-widget';
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
import AdminToolbar from './components/AdminToolbar';
import SpinnerIcon from './components/icons/SpinnerIcon';

const initialInfoFeatures: InfoFeature[] = [
  { icon: '🌿', title: '100% Orgánico', description: 'Elaborado con los mejores ingredientes naturales.' },
  { icon: '🐰', title: 'Libre de Crueldad', description: 'Nunca probamos en animales.' },
  { icon: '🌎', title: 'Ecológico', description: 'Embalaje sostenible para un planeta más feliz.' },
  { icon: '💖', title: 'Hecho con Amor', description: 'Cada producto es un testimonio de nuestra pasión.' },
];

function App() {
  // CMS and Local Storage state
  const [products, setProducts] = useState<Product[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>('cart', []);
  const [user, setUser] = useState(netlifyIdentity.currentUser());

  // App view state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Modal state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Initialize Netlify Identity
  useEffect(() => {
    netlifyIdentity.init();
    netlifyIdentity.on('login', (user) => {
      setUser(user);
      netlifyIdentity.close();
    });
    netlifyIdentity.on('logout', () => {
      setUser(null);
    });

    return () => {
      netlifyIdentity.off('login');
      netlifyIdentity.off('logout');
    };
  }, []);

  // Fetch content from JSON files
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [productsRes, heroRes, faqsRes, settingsRes] = await Promise.all([
          fetch('/content/products.json'),
          fetch('/content/hero.json'),
          fetch('/content/faqs.json'),
          fetch('/content/settings.json')
        ]);
        
        const productsData = await productsRes.json();
        const processedProducts = productsData.products.map((p: any, index: number) => ({
          ...p,
          id: p.id || index + 1,
          images: p.images.map((img: any) => (typeof img === 'string' ? img : img.image)),
        }));
        setProducts(processedProducts);
        
        const heroData = await heroRes.json();
        const processedSlides = heroData.slides.map((s: any, index: number) => ({...s, id: s.id || index + 1}));
        setSlides(processedSlides);

        const faqsData = await faqsRes.json();
        const processedFaqs = faqsData.faqs.map((f: any, index: number) => ({...f, id: f.id || index + 1}));
        setFaqs(processedFaqs);

        const settingsData = await settingsRes.json();
        setSettings(settingsData);
        
      } catch (err) {
        console.error("Failed to fetch content:", err);
        setError("No se pudo cargar el contenido del sitio. Por favor, inténtelo de nuevo más tarde.");
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
  
  const handleLogin = () => netlifyIdentity.open();
  const handleLogout = () => netlifyIdentity.logout();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <SpinnerIcon className="h-12 w-12 text-brand-pink animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 text-gray-800" style={{ paddingTop: user ? '48px' : '0' }}>
      {user && <AdminToolbar onLogout={handleLogout} />}
      <Header
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
        onLoginClick={handleLogin}
        isScrolled={isScrolled}
        siteName={settings.siteName || 'Makeup Glamours'}
        logoDataUri={settings.logo || ''}
        isProductPage={!!selectedProduct}
      />

      <main>
        {selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            isAdmin={!!user}
          />
        ) : (
          <>
            <HeroSlider 
              slides={slides} 
              sliderSpeed={settings.sliderSpeed || 5000}
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

      <Footer 
        siteName={settings.siteName || 'Makeup Glamours'} 
        logoDataUri={settings.logo || ''}
        phoneNumber={settings.phoneNumber || ''} 
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        phoneNumber={settings.phoneNumber || ''}
      />
    </div>
  );
}

export default App;
