import React, { useState, useMemo, useEffect } from 'react';
import { Product, Slide, FaqItem, CartItem, InfoFeature } from './types';
import { PRODUCTS, SLIDES, FAQS, LOGO_DATA_URI as INITIAL_LOGO } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';

import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import InfoSection from './components/InfoSection';
import WavyDivider from './components/WavyDivider';
import CategoryFilter from './components/CategoryFilter';
import ProductGrid from './components/ProductGrid';
import ProductDetail from './components/ProductDetail';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import CartModal from './components/CartModal';
import LoginModal from './components/LoginModal';
import AdminToolbar from './components/AdminToolbar';
import AdminDashboard from './components/AdminDashboard';
import SliderEditModal from './components/SliderEditModal';

const initialInfoFeatures: InfoFeature[] = [
  { icon: '🌿', title: '100% Organic', description: 'Crafted with the finest natural ingredients.' },
  { icon: '🐰', title: 'Cruelty-Free', description: 'We never test on animals, only on willing humans.' },
  { icon: '🌎', title: 'Eco-Friendly', description: 'Sustainable packaging for a happier planet.' },
  { icon: '💖', title: 'Made with Love', description: 'Every product is a testament to our passion.' },
];


function App() {
  // Local storage state
  const [products, setProducts] = useLocalStorage<Product[]>('products', PRODUCTS);
  const [slides, setSlides] = useLocalStorage<Slide[]>('slides', SLIDES);
  const [faqs, setFaqs] = useLocalStorage<FaqItem[]>('faqs', FAQS);
  const [infoFeatures, setInfoFeatures] = useLocalStorage<InfoFeature[]>('infoFeatures', initialInfoFeatures);
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>('cart', []);
  const [isAdmin, setIsAdmin] = useLocalStorage<boolean>('isAdmin', false);
  const [sliderSpeed, setSliderSpeed] = useLocalStorage<number>('sliderSpeed', 5000);
  const [showSoldOut, setShowSoldOut] = useLocalStorage<boolean>('showSoldOut', true);
  const [siteName, setSiteName] = useLocalStorage<string>('siteName', 'Makeup Glamours');
  const [logo, setLogo] = useLocalStorage<string>('logo', INITIAL_LOGO);
  const [phoneNumber, setPhoneNumber] = useLocalStorage<string>('phoneNumber', '50375771383');

  // View state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Modal state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSliderEditorOpen, setIsSliderEditorOpen] = useState(false);
  
  // Admin state
  const [adminView, setAdminView] = useState<'site' | 'dashboard'>('site');
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    if (isAdmin) {
      document.body.style.paddingTop = '48px';
    } else {
      document.body.style.paddingTop = '0';
    }
    return () => { document.body.style.paddingTop = '0'; };
  }, [isAdmin]);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => showSoldOut || p.stock > 0)
      .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, selectedCategory, searchQuery, showSoldOut]);
  
  const cartItemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);
  
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    if (product.stock <= 0) return; // Do not add sold out products to cart
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
  
  const handleLogin = () => {
    setIsAdmin(true);
    setIsLoginOpen(false);
  };
  
  const handleLogout = () => {
    setIsAdmin(false);
    setAdminView('site');
  };
  
  // Handlers for admin edits
  const handleFaqUpdate = (id: number, field: 'question' | 'answer', value: string) => {
    setFaqs(faqs.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleSlideUpdate = (id: number, field: keyof Omit<Slide, 'id' | 'imageUrl'>, value: string) => {
    setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleInfoFeatureUpdate = (index: number, field: keyof InfoFeature, value: string) => {
    setInfoFeatures(features => features.map((f, i) => i === index ? { ...f, [field]: value } : f));
  };

  const handleSaveProduct = (productToSave: Product) => {
    const exists = products.some(p => p.id === productToSave.id);
    if (exists) {
      setProducts(products.map(p => p.id === productToSave.id ? productToSave : p));
    } else {
      setProducts([...products, productToSave]);
    }
  };

  const handleDeleteProduct = (productToDelete: Product) => {
    setProducts(products.filter(p => p.id !== productToDelete.id));
  };
  
  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: Date.now(),
      imageUrl: 'https://picsum.photos/1920/1080?random=' + Date.now(),
      title: 'New Slide Title',
      subtitle: 'New slide subtitle text goes here.',
      buttonText: 'Click Me'
    };
    setSlides([...slides, newSlide]);
  };
  
  const handleUpdateSingleSlide = (slide: Slide) => {
    setSlides(slides.map(s => s.id === slide.id ? slide : s));
  };

  const handleDeleteSlide = (slideId: number) => {
    setSlides(slides.filter(s => s.id !== slideId));
  };

  if (isAdmin && adminView === 'dashboard') {
    return (
      <>
        <AdminToolbar onSetView={setAdminView} onLogout={handleLogout} />
        <AdminDashboard 
          products={products} 
          onSaveProduct={handleSaveProduct} 
          onDeleteProduct={handleDeleteProduct} 
          showSoldOut={showSoldOut}
          onSetShowSoldOut={setShowSoldOut}
          siteName={siteName}
          onSiteNameChange={setSiteName}
          logo={logo}
          onLogoChange={setLogo}
          phoneNumber={phoneNumber}
          onPhoneNumberChange={setPhoneNumber}
        />
      </>
    );
  }

  return (
    <div className="bg-gray-50 text-gray-800">
      {isAdmin && <AdminToolbar onSetView={setAdminView} onLogout={handleLogout} />}
      <Header
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
        onLoginClick={() => setIsLoginOpen(true)}
        isAdmin={isAdmin}
        isScrolled={isScrolled}
        siteName={siteName}
        logoDataUri={logo}
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
              isAdmin={isAdmin} 
              onUpdate={handleSlideUpdate} 
              sliderSpeed={sliderSpeed}
              onOpenSliderEditor={() => setIsSliderEditorOpen(true)}
            />
            <InfoSection features={infoFeatures} isAdmin={isAdmin} onUpdate={handleInfoFeatureUpdate} />
            <WavyDivider />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <CategoryFilter
                categories={['All', ...new Set(products.map(p => p.category))]}
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
            <FaqSection faqs={faqs} isAdmin={isAdmin} onUpdate={handleFaqUpdate} />
          </>
        )}
      </main>

      <Footer siteName={siteName} logoDataUri={logo} phoneNumber={phoneNumber} />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        phoneNumber={phoneNumber}
      />
      
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />
      
      {isAdmin && (
        <SliderEditModal 
          isOpen={isSliderEditorOpen}
          onClose={() => setIsSliderEditorOpen(false)}
          slides={slides}
          sliderSpeed={sliderSpeed}
          onSpeedChange={setSliderSpeed}
          onAddSlide={handleAddSlide}
          onUpdateSlide={handleUpdateSingleSlide}
          onDeleteSlide={handleDeleteSlide}
        />
      )}
    </div>
  );
}

export default App;