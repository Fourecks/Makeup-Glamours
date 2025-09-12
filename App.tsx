import React, { useState, useMemo, useEffect } from 'react';
import { Product, Slide, FaqItem, CartItem, InfoFeature } from './types';
import { PRODUCTS, SLIDES, FAQS, LOGO_DATA_URI as INITIAL_LOGO } from './constants';
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
import LoginModal from './components/LoginModal';
import AdminToolbar from './components/AdminToolbar';
import AdminDashboard from './components/AdminDashboard';
import SliderEditModal from './components/SliderEditModal';

const initialInfoFeatures: InfoFeature[] = [
  { icon: '🌿', title: '100% Orgánico', description: 'Elaborado con los mejores ingredientes naturales.' },
  { icon: '🐰', title: 'Libre de Crueldad', description: 'Nunca probamos en animales.' },
  { icon: '🌎', title: 'Ecológico', description: 'Embalaje sostenible para un planeta más feliz.' },
  { icon: '💖', title: 'Hecho con Amor', description: 'Cada producto es un testimonio de nuestra pasión.' },
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
  const [selectedCategory, setSelectedCategory] = useState('Todos');
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
    const adminToolbar = document.querySelector('.fixed.top-0.left-0.right-0.bg-gray-800');
    if (isAdmin && adminToolbar) {
        const toolbarHeight = adminToolbar.getBoundingClientRect().height;
        document.body.style.paddingTop = `${toolbarHeight}px`;
    } else {
        document.body.style.paddingTop = '0';
    }
    
    // Resize observer to handle responsive height changes of the toolbar
    const observer = new ResizeObserver(entries => {
        if (isAdmin && entries[0]) {
            const height = entries[0].contentRect.height;
            document.body.style.paddingTop = `${height}px`;
        }
    });

    if (isAdmin && adminToolbar) {
        observer.observe(adminToolbar);
    }
    
    return () => { 
        document.body.style.paddingTop = '0';
        if (adminToolbar) observer.unobserve(adminToolbar);
    };
  }, [isAdmin, adminView]);
  
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
      .filter(p => selectedCategory === 'Todos' || p.category === selectedCategory)
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
      imageUrl: 'https://placehold.co/1920x1080/E57399/FFFFFF?text=Nueva+Diapositiva',
      title: 'Nuevo Título de Diapositiva',
      subtitle: 'El texto del subtítulo de la nueva diapositiva va aquí.',
      buttonText: 'Haz Clic'
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
          onSetProducts={setProducts}
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
        isProductPage={!!selectedProduct}
      />

      <main>
        {selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            isAdmin={isAdmin}
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