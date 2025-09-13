import React, { useState, useEffect, useMemo } from 'react';
import { Product, Slide, FaqItem, SiteConfig, CartItem, InfoFeature } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { PRODUCTS as INITIAL_PRODUCTS, SLIDES as INITIAL_SLIDES, FAQS as INITIAL_FAQS, LOGO_DATA_URI } from './constants';

// Components
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import ProductGrid from './components/ProductGrid';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import ProductDetail from './components/ProductDetail';
import CartModal from './components/CartModal';
import LoginModal from './components/LoginModal';
import AdminToolbar from './components/AdminToolbar';
import AdminDashboard from './components/AdminDashboard';
import CategoryFilter from './components/CategoryFilter';
import SliderEditModal from './components/SliderEditModal';
import InfoSection from './components/InfoSection';

// Initial Data
const INITIAL_INFO_FEATURES: InfoFeature[] = [
    { icon: '✨', title: 'Calidad Premium', description: 'Ingredientes de la más alta calidad para resultados increíbles.' },
    { icon: '🐰', title: 'Cruelty-Free', description: 'Nunca probamos nuestros productos en animales.' },
    { icon: '🌿', title: 'Ingredientes Naturales', description: 'Belleza que es buena para ti y para el planeta.' },
    { icon: '🚚', title: 'Envío Rápido', description: 'Recibe tus productos favoritos en la puerta de tu casa.' },
];

const INITIAL_SITE_CONFIG: SiteConfig = {
    id: 1,
    site_name: 'Makeup Glamours',
    logo: LOGO_DATA_URI,
    phone_number: '50375771383',
    instagram_url: 'https://instagram.com',
    slider_speed: 4000,
    show_sold_out: true,
    created_at: new Date().toISOString()
};


function App() {
    // Admin state
    const [isAdmin, setIsAdmin] = useLocalStorage('isAdmin', false);
    const [adminView, setAdminView] = useState<'site' | 'dashboard'>('site');

    // Data state using localStorage
    const [products, setProducts] = useLocalStorage<Product[]>('products', INITIAL_PRODUCTS);
    const [slides, setSlides] = useLocalStorage<Slide[]>('slides', INITIAL_SLIDES);
    const [faqs, setFaqs] = useLocalStorage<FaqItem[]>('faqs', INITIAL_FAQS);
    const [siteConfig, setSiteConfig] = useLocalStorage<SiteConfig>('siteConfig', INITIAL_SITE_CONFIG);
    const [infoFeatures, setInfoFeatures] = useLocalStorage<InfoFeature[]>('infoFeatures', INITIAL_INFO_FEATURES);
    const [cartItems, setCartItems] = useLocalStorage<CartItem[]>('cart', []);

    // UI State
    const [currentView, setCurrentView] = useState<'home' | 'productDetail'>('home');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [isSliderEditModalOpen, setIsSliderEditModalOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState('');

    // Derived state
    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const categories = ['Todos', ...new Set(products.map(p => p.category))];

    const filteredProducts = useMemo(() => {
        let filtered = products;

        if (!siteConfig.show_sold_out) {
            filtered = filtered.filter(p => p.stock > 0);
        }

        if (selectedCategory !== 'Todos') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        if (searchQuery) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        return filtered;
    }, [products, selectedCategory, searchQuery, siteConfig.show_sold_out]);


    // Effects
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handlers
    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setCurrentView('productDetail');
        window.scrollTo(0, 0);
    };

    const handleBackToHome = () => {
        setSelectedProduct(null);
        setCurrentView('home');
    };
    
    const handleAddToCart = (product: Product, quantity: number = 1) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prevItems, { ...product, quantity }];
        });
        setIsCartModalOpen(true);
    };

    const handleUpdateCartQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            handleRemoveFromCart(productId);
        } else {
            setCartItems(prevItems =>
                prevItems.map(item => (item.id === productId ? { ...item, quantity } : item))
            );
        }
    };

    const handleRemoveFromCart = (productId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };
    
    const handleLogin = () => {
        setIsAdmin(true);
        setIsLoginModalOpen(false);
    };
    
    const handleLogout = () => {
        setIsAdmin(false);
        setAdminView('site');
    };

    const handleFaqUpdate = (id: number, field: 'question' | 'answer', value: string) => {
        setFaqs(prev => prev.map(faq => (faq.id === id ? { ...faq, [field]: value } : faq)));
    };

    const handleInfoFeatureUpdate = (index: number, field: keyof InfoFeature, value: string) => {
        setInfoFeatures(prev => prev.map((feature, i) => (i === index ? { ...feature, [field]: value } : feature)));
    };
    
    const handleSlideUpdate = (id: number, field: keyof Omit<Slide, 'id' | 'image_url' | 'created_at' | 'order' | 'button_link'>, value: string) => {
        setSlides(prev => prev.map(slide => (slide.id === id ? { ...slide, [field]: value } : slide)));
    };

    const handleUpdateFullSlide = (updatedSlide: Slide) => {
        setSlides(prev => prev.map(slide => slide.id === updatedSlide.id ? updatedSlide : slide));
    };

    const handleAddSlide = () => {
        const newSlide: Slide = {
            id: Date.now(),
            title: 'Nuevo Título',
            subtitle: 'Este es un subtítulo de ejemplo para la nueva diapositiva. Haz clic para editar.',
            button_text: 'Comprar Ahora',
            button_link: '#',
            image_url: `https://via.placeholder.com/1920x1080/f0f0f0/333333?text=Añadir+imagen`,
            order: slides.length + 1,
            created_at: new Date().toISOString()
        };
        setSlides(prev => [...prev, newSlide]);
    };

    const handleDeleteSlide = (id: number) => {
        setSlides(prev => prev.filter(s => s.id !== id));
    };

    const handleSaveProduct = (product: Product) => {
        setProducts(prev => {
            if (product.id === 'new-product-placeholder') {
                return [...prev, { ...product, id: `prod-${Date.now()}` }];
            }
            return prev.map(p => (p.id === product.id ? product : p));
        });
    };

    const handleDeleteProduct = (productToDelete: Product) => {
        setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
    };

    const handleSiteConfigUpdate = (config: Partial<SiteConfig>) => {
        setSiteConfig(prev => ({...prev, ...config}));
    };

    const isProductPage = currentView === 'productDetail';

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            {isAdmin && <AdminToolbar onSetView={setAdminView} onLogout={handleLogout} />}

            {isAdmin && adminView === 'dashboard' ? (
                <div className="pt-12 sm:pt-12">
                    <AdminDashboard 
                        products={products}
                        onSaveProduct={handleSaveProduct}
                        onDeleteProduct={handleDeleteProduct}
                        onSetProducts={setProducts}
                        siteConfig={siteConfig}
                        onSiteConfigUpdate={handleSiteConfigUpdate}
                    />
                </div>
            ) : (
                <>
                    <Header
                        cartItemCount={cartItemCount}
                        onCartClick={() => setIsCartModalOpen(true)}
                        onLoginClick={() => setIsLoginModalOpen(true)}
                        isAdmin={isAdmin}
                        isScrolled={isScrolled}
                        siteName={siteConfig.site_name}
                        logo={siteConfig.logo}
                        isProductPage={isProductPage}
                    />

                    {currentView === 'home' && (
                        <>
                            <HeroSlider
                                slides={slides}
                                isAdmin={isAdmin}
                                onUpdate={handleSlideUpdate}
                                sliderSpeed={siteConfig.slider_speed}
                                onOpenSliderEditor={() => setIsSliderEditModalOpen(true)}
                            />
                            <InfoSection 
                                features={infoFeatures}
                                isAdmin={isAdmin}
                                onUpdate={handleInfoFeatureUpdate}
                            />
                            <main id="products" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                                <CategoryFilter 
                                    categories={categories}
                                    selectedCategory={selectedCategory}
                                    onSelectCategory={setSelectedCategory}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                />
                                <ProductGrid
                                    products={filteredProducts}
                                    onProductClick={handleProductClick}
                                    onAddToCart={handleAddToCart}
                                />
                            </main>
                            <FaqSection faqs={faqs} isAdmin={isAdmin} onUpdate={handleFaqUpdate} />
                        </>
                    )}

                    {currentView === 'productDetail' && selectedProduct && (
                        <ProductDetail
                            product={selectedProduct}
                            onBack={handleBackToHome}
                            onAddToCart={handleAddToCart}
                            isAdmin={isAdmin}
                        />
                    )}
                    
                    <Footer
                        siteName={siteConfig.site_name}
                        logo={siteConfig.logo}
                        phoneNumber={siteConfig.phone_number}
                        instagramUrl={siteConfig.instagram_url}
                    />

                    {/* Modals */}
                    <CartModal
                        isOpen={isCartModalOpen}
                        onClose={() => setIsCartModalOpen(false)}
                        cartItems={cartItems}
                        onUpdateQuantity={handleUpdateCartQuantity}
                        onRemoveItem={handleRemoveFromCart}
                        phoneNumber={siteConfig.phone_number}
                    />
                    <LoginModal
                        isOpen={isLoginModalOpen}
                        onClose={() => setIsLoginModalOpen(false)}
                        onLogin={handleLogin}
                    />
                    {isAdmin && (
                        <SliderEditModal
                            isOpen={isSliderEditModalOpen}
                            onClose={() => setIsSliderEditModalOpen(false)}
                            slides={slides}
                            sliderSpeed={siteConfig.slider_speed}
                            onSpeedChange={(speed) => handleSiteConfigUpdate({ slider_speed: speed })}
                            onAddSlide={handleAddSlide}
                            onUpdateSlide={handleUpdateFullSlide}
                            onDeleteSlide={handleDeleteSlide}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default App;