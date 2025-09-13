import React, { useState, useEffect, useMemo } from 'react';
import { Product, Slide, FaqItem, SiteConfig, CartItem, InfoFeature } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { LOGO_DATA_URI, FAQS as INITIAL_FAQS, INFO_FEATURES as INITIAL_INFO_FEATURES } from './constants';
import { supabase } from './supabaseClient';

// Components
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import ProductGrid from './components/ProductGrid';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import ProductDetail from './components/ProductDetail';
import CartModal from './components/CartModal';
import AdminToolbar from './components/AdminToolbar';
import AdminDashboard from './components/AdminDashboard';
import CategoryFilter from './components/CategoryFilter';
import SliderEditModal from './components/SliderEditModal';
import InfoSection from './components/InfoSection';
import SpinnerIcon from './components/icons/SpinnerIcon';
import LoginPage from './components/LoginPage';

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

    // Data state from Supabase
    const [products, setProducts] = useState<Product[]>([]);
    const [slides, setSlides] = useState<Slide[]>([]);
    const [faqs, setFaqs] = useState<FaqItem[]>(INITIAL_FAQS);
    const [siteConfig, setSiteConfig] = useState<SiteConfig>(INITIAL_SITE_CONFIG);
    const [infoFeatures, setInfoFeatures] = useState<InfoFeature[]>(INITIAL_INFO_FEATURES);
    
    // Client-side state
    const [cartItems, setCartItems] = useLocalStorage<CartItem[]>('cart', []);

    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState<'home' | 'productDetail'>('home');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [productsRes, slidesRes, siteConfigRes] = await Promise.all([
                    supabase.from('products').select('*').order('created_at', { ascending: false }),
                    supabase.from('hero_slides').select('*').order('order', { ascending: true }),
                    supabase.from('site_config').select('*').limit(1).single(),
                ]);

                if (productsRes.error) throw productsRes.error;
                setProducts(productsRes.data || []);

                if (slidesRes.error) throw slidesRes.error;
                setSlides(slidesRes.data || []);
                
                if (siteConfigRes.error) throw siteConfigRes.error;
                setSiteConfig(siteConfigRes.data || INITIAL_SITE_CONFIG);

            } catch (error) {
                console.error("Error fetching data:", error);
                setProducts([]);
                setSlides([]);
                setSiteConfig(INITIAL_SITE_CONFIG);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

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
            const currentQuantityInCart = existingItem?.quantity || 0;

            const availableStock = product.stock - currentQuantityInCart;
            if (availableStock <= 0) {
                console.log("No more stock available for this item.");
                return prevItems;
            }

            const quantityToAdd = Math.min(quantity, availableStock);
            
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
                );
            }
            
            return [...prevItems, { ...product, quantity: quantityToAdd }];
        });
    };

    const handleUpdateCartQuantity = (productId: string, quantity: number) => {
        const itemInCart = cartItems.find(i => i.id === productId);
        if (!itemInCart) return;

        if (quantity <= 0) {
            handleRemoveFromCart(productId);
        } else {
            const newQuantity = Math.min(quantity, itemInCart.stock);
            setCartItems(prevItems =>
                prevItems.map(item => (item.id === productId ? { ...item, quantity: newQuantity } : item))
            );
        }
    };

    const handleRemoveFromCart = (productId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };
    
    const handleLogin = () => {
        setIsAdmin(true);
    };
    
    const handleLogout = () => {
        setIsAdmin(false);
        window.location.href = '/';
    };

    const handleSlideUpdate = async (id: number, field: keyof Omit<Slide, 'id' | 'image_url' | 'created_at' | 'order' | 'button_link'>, value: string) => {
        const { error } = await supabase.from('hero_slides').update({ [field]: value }).eq('id', id);
        if (error) console.error('Error updating slide field:', error);
        else setSlides(prev => prev.map(slide => (slide.id === id ? { ...slide, [field]: value } : slide)));
    };

    const handleUpdateFullSlide = async (updatedSlide: Slide) => {
        const { error } = await supabase.from('hero_slides').update(updatedSlide).eq('id', updatedSlide.id);
        if(error) console.error('Error updating slide:', error);
        else setSlides(prev => prev.map(slide => slide.id === updatedSlide.id ? updatedSlide : slide));
    };

    const handleAddSlide = async () => {
        const newSlideData: Omit<Slide, 'id' | 'created_at'> = {
            title: 'Nuevo Título',
            subtitle: 'Este es un subtítulo de ejemplo para la nueva diapositiva. Haz clic para editar.',
            button_text: 'Comprar Ahora',
            button_link: '#',
            image_url: `https://via.placeholder.com/1920x1080/f0f0f0/333333?text=Añadir+imagen`,
            order: slides.length + 1,
        };
        const { data, error } = await supabase.from('hero_slides').insert(newSlideData).select().single();
        if(error) console.error('Error adding slide:', error);
        else if (data) setSlides(prev => [...prev, data]);
    };

    const handleDeleteSlide = async (id: number) => {
        const { error } = await supabase.from('hero_slides').delete().eq('id', id);
        if (error) console.error('Error deleting slide:', error);
        else setSlides(prev => prev.filter(s => s.id !== id));
    };

    const handleSaveProduct = async (product: Product) => {
        if (product.id === 'new-product-placeholder') {
            const { id, ...productData } = product;
            const { data, error } = await supabase.from('products').insert(productData).select().single();
            if (error) {
                console.error('Error creating product:', error);
                alert(`Error: ${error.message}`);
            }
            else if (data) setProducts(prev => [data, ...prev]);
        } else {
            const { error } = await supabase.from('products').update(product).eq('id', product.id);
            if (error) {
                console.error('Error updating product:', error);
                alert(`Error: ${error.message}`);
            }
            else setProducts(prev => prev.map(p => (p.id === product.id ? product : p)));
        }
    };
    
    const handleDeleteProduct = async (productToDelete: Product) => {
        const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
        if (error) console.error('Error deleting product:', error);
        else setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
    };
    
    const handleBulkUpdateProducts = async (updatedProducts: Product[]) => {
        const { error } = await supabase.from('products').upsert(updatedProducts);
        if (error) console.error('Error bulk updating products:', error);
        else setProducts(updatedProducts);
    };

    const handleSiteConfigUpdate = async (config: Partial<SiteConfig>) => {
        const newConfig = {...siteConfig, ...config};
        const { error } = await supabase.from('site_config').update(config).eq('id', siteConfig.id);
        if(error) console.error('Error updating site config:', error);
        else setSiteConfig(newConfig);
    };

    const isProductPage = currentView === 'productDetail';

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <SpinnerIcon className="h-12 w-12 text-brand-pink animate-spin mx-auto" />
                    <p className="mt-4 text-lg text-gray-600">Cargando la tienda...</p>
                </div>
            </div>
        );
    }
    
    const pathname = window.location.pathname;

    if (pathname.startsWith('/admin')) {
        if (isAdmin) {
            return (
                 <div className="bg-gray-100 min-h-screen">
                     <AdminToolbar onLogout={handleLogout} />
                     <div className="pt-12 sm:pt-12">
                         <AdminDashboard 
                             products={products}
                             onSaveProduct={handleSaveProduct}
                             onDeleteProduct={handleDeleteProduct}
                             onSetProducts={handleBulkUpdateProducts}
                             siteConfig={siteConfig}
                             onSiteConfigUpdate={handleSiteConfigUpdate}
                         />
                     </div>
                 </div>
            );
        } else {
            return <LoginPage onLogin={handleLogin} siteName={siteConfig.site_name} logo={siteConfig.logo} />;
        }
    }


    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            {isAdmin && <AdminToolbar onLogout={handleLogout} />}

            <Header
                cartItemCount={cartItemCount}
                onCartClick={() => setIsCartModalOpen(true)}
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
                    <FaqSection faqs={faqs} />
                </>
            )}

            {currentView === 'productDetail' && selectedProduct && (
                <ProductDetail
                    product={selectedProduct}
                    onBack={handleBackToHome}
                    onAddToCart={handleAddToCart}
                    isAdmin={isAdmin}
                    cartItems={cartItems}
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
        </div>
    );
}

export default App;