import React, { useState, useEffect, useMemo } from 'react';
import { Product, Slide, FaqItem, SiteConfig, CartItem, InfoFeature, ProductVariant } from './types';
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
import LoginModal from './components/LoginModal';

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

function logSupabaseError(context: string, error: any) {
    if (error && typeof error === 'object') {
        const { message, details, hint, code } = error;
        console.error(`[Supabase Error] ${context}:`, {
            message: message || "No message provided.",
            details: details || "No details provided.",
            hint: hint || "No hint provided.",
            code: code || "No code provided.",
            originalError: error,
        });
    } else {
        console.error(`[Generic Error] ${context}:`, error);
    }
}


function App() {
    const [isAdmin, setIsAdmin] = useLocalStorage('isAdmin', false);
    const [adminView, setAdminView] = useState<'site' | 'dashboard'>('site');
    const [products, setProducts] = useState<Product[]>([]);
    const [slides, setSlides] = useState<Slide[]>([]);
    const [faqs, setFaqs] = useState<FaqItem[]>(INITIAL_FAQS);
    const [siteConfig, setSiteConfig] = useState<SiteConfig>(INITIAL_SITE_CONFIG);
    const [infoFeatures, setInfoFeatures] = useState<InfoFeature[]>(INITIAL_INFO_FEATURES);
    const [cartItems, setCartItems] = useLocalStorage<CartItem[]>('cart', []);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState<'home' | 'productDetail'>('home');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [isSliderEditModalOpen, setIsSliderEditModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState('');

    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const categories = ['Todos', ...new Set(products.map(p => p.category))];

    const filteredProducts = useMemo(() => {
        let filtered = products;

        if (!siteConfig.show_sold_out) {
            filtered = filtered.filter(p => {
                const totalStock = p.variants?.length > 0 
                    ? p.variants.reduce((sum, v) => sum + v.stock, 0) 
                    : p.stock;
                return totalStock > 0;
            });
        }

        if (selectedCategory !== 'Todos') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        if (searchQuery) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        return filtered;
    }, [products, selectedCategory, searchQuery, siteConfig.show_sold_out]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [productsRes, variantsRes, slidesRes, siteConfigRes] = await Promise.all([
                    supabase.from('products').select('*').order('created_at', { ascending: false }),
                    supabase.from('product_variants').select('*'),
                    supabase.from('hero_slides').select('*').order('order', { ascending: true }),
                    supabase.from('site_config').select('*').limit(1).single(),
                ]);

                if (productsRes.error) throw productsRes.error;
                if (variantsRes.error) throw variantsRes.error;
                if (slidesRes.error) throw slidesRes.error;
                if (siteConfigRes.error) throw siteConfigRes.error;

                const productsData = productsRes.data || [];
                const variantsData = variantsRes.data || [];

                const productsWithVariants = productsData.map(p => ({
                    ...p,
                    variants: variantsData.filter(v => v.product_id === p.id)
                }));

                setProducts(productsWithVariants);
                setSlides(slidesRes.data || []);
                setSiteConfig(siteConfigRes.data || INITIAL_SITE_CONFIG);

            } catch (error) {
                logSupabaseError("Error fetching initial site data", error);
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

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setCurrentView('productDetail');
        window.scrollTo(0, 0);
    };

    const handleBackToHome = () => {
        setSelectedProduct(null);
        setCurrentView('home');
    };
    
    const handleAddToCart = (product: Product, quantity: number = 1, selectedVariant: ProductVariant | null = null) => {
        setCartItems(prevItems => {
            const cartItemId = selectedVariant ? `${product.id}-${selectedVariant.id}` : `${product.id}-base`;
            const existingItem = prevItems.find(item => item.id === cartItemId);

            const itemStock = selectedVariant ? selectedVariant.stock : product.stock;
            const variantName = selectedVariant ? selectedVariant.name : null;
            const itemImage = selectedVariant?.image_url || product.image_url?.split(',')[0]?.trim() || 'https://picsum.photos/150';

            const currentQuantityInCart = existingItem?.quantity || 0;
            const availableStock = itemStock - currentQuantityInCart;
            if (availableStock <= 0) {
                alert("No hay más existencias de este artículo.");
                return prevItems;
            }

            const quantityToAdd = Math.min(quantity, availableStock);
            
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === cartItemId ? { ...item, quantity: item.quantity + quantityToAdd } : item
                );
            }
            
            const newCartItem: CartItem = {
                id: cartItemId,
                productId: product.id,
                productName: product.name,
                variantId: selectedVariant?.id || null,
                variantName: variantName,
                price: product.price,
                imageUrl: itemImage,
                quantity: quantityToAdd,
                stock: itemStock,
            };
            return [...prevItems, newCartItem];
        });
    };


    const handleUpdateCartQuantity = (cartItemId: string, quantity: number) => {
        const itemInCart = cartItems.find(i => i.id === cartItemId);
        if (!itemInCart) return;

        if (quantity <= 0) {
            handleRemoveFromCart(cartItemId);
        } else {
            const newQuantity = Math.min(quantity, itemInCart.stock);
            setCartItems(prevItems =>
                prevItems.map(item => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item))
            );
        }
    };

    const handleRemoveFromCart = (cartItemId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
    };
    
    const handleLogin = () => {
        setIsAdmin(true);
        setIsLoginModalOpen(false);
    };
    
    const handleLogout = () => {
        setIsAdmin(false);
        setAdminView('site');
    };

    const handleSlideUpdate = async (id: number, field: keyof Omit<Slide, 'id' | 'image_url' | 'created_at' | 'order' | 'button_link'>, value: string) => {
        const { error } = await supabase.from('hero_slides').update({ [field]: value }).eq('id', id);
        if (error) logSupabaseError('Error updating slide field', error);
        else setSlides(prev => prev.map(slide => (slide.id === id ? { ...slide, [field]: value } : slide)));
    };

    const handleUpdateFullSlide = async (updatedSlide: Slide) => {
        const { error } = await supabase.from('hero_slides').update(updatedSlide).eq('id', updatedSlide.id);
        if(error) logSupabaseError('Error updating full slide', error);
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
        if(error) logSupabaseError('Error adding slide', error);
        else if (data) setSlides(prev => [...prev, data]);
    };

    const handleDeleteSlide = async (id: number) => {
        const { error } = await supabase.from('hero_slides').delete().eq('id', id);
        if (error) logSupabaseError('Error deleting slide', error);
        else setSlides(prev => prev.filter(s => s.id !== id));
    };
    
    const refreshProductState = async (productId: string, isNew: boolean) => {
        const { data: refreshedProduct, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();
        
        const { data: refreshedVariants, error: variantsError } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', productId);

        if (productError || variantsError) {
            logSupabaseError('Error refreshing product state', productError || variantsError);
            return;
        }

        if (refreshedProduct) {
            refreshedProduct.variants = refreshedVariants || [];
            setProducts(prev => {
                if (isNew) return [refreshedProduct, ...prev];
                return prev.map(p => p.id === productId ? refreshedProduct : p);
            });
        }
    };

    const handleSaveProduct = async (product: Product, variantsToSave: ProductVariant[], variantIdsToDelete: string[], imagesToDelete: string[]) => {
        const bucketName = import.meta.env.VITE_SUPABASE_BUCKET;

        const getPathFromUrl = (url: string) => {
            if (!bucketName || !url || url.startsWith('data:')) return '';
            try {
                const urlObject = new URL(url);
                const pathParts = urlObject.pathname.split(`/${bucketName}/`);
                return pathParts.length > 1 ? pathParts[1] : '';
            } catch (error) { 
                console.error("Invalid URL for storage path extraction:", url);
                return '';
            }
        };

        if (imagesToDelete.length > 0 && bucketName) {
            const pathsToDelete = imagesToDelete.map(getPathFromUrl).filter(Boolean);
            if (pathsToDelete.length > 0) {
                const { error } = await supabase.storage.from(bucketName).remove(pathsToDelete);
                if (error) logSupabaseError('Error deleting images from storage', error);
            }
        }

        const isNewProduct = !product.id || product.id === 'new-product-placeholder';
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { variants, ...productData } = product;
    
        let savedProductId: string | null = null;
    
        if (isNewProduct) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...newProductData } = productData;
            const { data, error } = await supabase.from('products').insert(newProductData).select('id').single();
            if (error || !data) {
                logSupabaseError('Error creating product', error);
                return;
            }
            savedProductId = data.id;
        } else {
            const { error } = await supabase.from('products').update(productData).eq('id', product.id);
            if (error) {
                logSupabaseError('Error updating product', error);
                return;
            }
            savedProductId = product.id;
        }
    
        if (!savedProductId) return;
    
        if (variantIdsToDelete.length > 0) {
            const { error } = await supabase.from('product_variants').delete().in('id', variantIdsToDelete);
            if (error) logSupabaseError('Error deleting variants', error);
        }
    
        const newVariants = variantsToSave.filter(v => v.id.startsWith('new-'));
        const existingVariants = variantsToSave.filter(v => !v.id.startsWith('new-'));
    
        if (newVariants.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const variantsToInsert = newVariants.map(({ id, ...rest }) => ({
                ...rest,
                product_id: savedProductId!
            }));
            const { error } = await supabase.from('product_variants').insert(variantsToInsert);
            if (error) logSupabaseError('Error inserting new variants', error);
        }
    
        if (existingVariants.length > 0) {
            for (const variant of existingVariants) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...dataToUpdate } = variant;
                const { error } = await supabase.from('product_variants').update({ ...dataToUpdate, product_id: savedProductId! }).eq('id', id);
                if (error) logSupabaseError(`Error updating variant ${id}`, error);
            }
        }
        
        await refreshProductState(savedProductId, isNewProduct);
    };
    
    const handleDeleteProduct = async (productToDelete: Product) => {
        if (productToDelete.variants && productToDelete.variants.length > 0) {
            const variantIds = productToDelete.variants.map(v => v.id);
            const { error: variantError } = await supabase.from('product_variants').delete().in('id', variantIds);
            if (variantError) {
                logSupabaseError('Error deleting product variants', variantError);
                alert(`Error deleting variants: ${variantError.message}`);
                return;
            }
        }
        
        const allImageUrls: string[] = [];
        if (productToDelete.image_url) {
            productToDelete.image_url.split(',').forEach(url => allImageUrls.push(url.trim()));
        }
        if (productToDelete.variants) {
            productToDelete.variants.forEach(v => {
                if (v.image_url) allImageUrls.push(v.image_url);
            });
        }
        
        const uniqueImageUrls = [...new Set(allImageUrls.filter(Boolean))];

        if (uniqueImageUrls.length > 0) {
            const bucketName = import.meta.env.VITE_SUPABASE_BUCKET;
            if(!bucketName) {
                alert('Error: Supabase bucket name is not configured.');
            } else {
                const getPathFromUrl = (url: string) => {
                    if (url.startsWith('data:')) return '';
                    try {
                        const urlObject = new URL(url);
                        const pathParts = urlObject.pathname.split(`/${bucketName}/`);
                        return pathParts.length > 1 ? pathParts[1] : '';
                    } catch (error) { return ''; }
                };
                const pathsToDelete = uniqueImageUrls.map(getPathFromUrl).filter(Boolean);
                if (pathsToDelete.length > 0) {
                    const { error: deleteError } = await supabase.storage.from(bucketName).remove(pathsToDelete);
                    if (deleteError) {
                        logSupabaseError('Error deleting product images from storage', deleteError);
                    }
                }
            }
        }
        
        const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
        if (error) {
            logSupabaseError('Error deleting product', error);
        }
        else {
            setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
            if (selectedProduct?.id === productToDelete.id) {
                handleBackToHome();
            }
        }
    };
    
    const handleBulkUpdateProducts = async (updatedProducts: Product[]) => {
        // We need to separate products from variants before upserting
        const productsToUpsert = updatedProducts.map(({variants, ...rest}) => rest);
        const { error } = await supabase.from('products').upsert(productsToUpsert);
        if (error) {
            logSupabaseError('Error bulk updating products', error);
        } else {
            // Since we cannot easily bulk-update variants here, we refresh the state
            // to ensure consistency. A more complex implementation could handle variant updates.
            setProducts(updatedProducts); 
        }
    };

    const handleSiteConfigUpdate = async (config: Partial<Omit<SiteConfig, 'logo'>>) => {
        const newConfig = {...siteConfig, ...config};
        const { error } = await supabase.from('site_config').update(config).eq('id', siteConfig.id);
        if(error) logSupabaseError('Error updating site config', error);
        else setSiteConfig(newConfig);
    };

    const handleUpdateLogo = async (file: File) => {
        const bucketName = import.meta.env.VITE_SUPABASE_BUCKET;
        if (!bucketName) {
            alert("Error: El nombre del bucket de Supabase no está configurado.");
            throw new Error("Supabase bucket name not configured.");
        }
    
        const fileExt = file.name.split('.').pop();
        const newFilePath = `public/logo-${Date.now()}.${fileExt}`;
    
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(newFilePath, file);
    
        if (uploadError) {
            logSupabaseError("Error subiendo el nuevo logo", uploadError);
            throw uploadError;
        }
    
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(newFilePath);
        const newPublicUrl = urlData.publicUrl;
    
        const { error: updateError } = await supabase
            .from('site_config')
            .update({ logo: newPublicUrl, updated_at: new Date().toISOString() })
            .eq('id', siteConfig.id);
    
        if (updateError) {
            logSupabaseError("Error actualizando la URL del logo en la base de datos", updateError);
            await supabase.storage.from(bucketName).remove([newFilePath]);
            throw updateError;
        }
    
        const oldLogoUrl = siteConfig.logo;
        setSiteConfig(prev => ({ ...prev, logo: newPublicUrl }));
        
        const getPathFromUrl = (url: string) => {
            if (!url || url.startsWith('data:')) return '';
            try {
                const urlObject = new URL(url);
                const pathParts = urlObject.pathname.split(`/${bucketName}/`);
                return pathParts.length > 1 ? pathParts[1] : '';
            } catch (error) { return ''; }
        };
    
        const oldLogoPath = getPathFromUrl(oldLogoUrl);
        if (oldLogoPath) {
            const { error: deleteError } = await supabase.storage.from(bucketName).remove([oldLogoPath]);
            if (deleteError) {
                logSupabaseError("No se pudo eliminar el logo antiguo del almacenamiento", deleteError);
            }
        }
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
    
    if (isAdmin && adminView === 'dashboard') {
        return (
             <div className="bg-gray-100 min-h-screen">
                 <AdminToolbar onLogout={handleLogout} onToggleView={() => setAdminView('site')} currentView="dashboard" />
                 <div className="pt-12 sm:pt-12">
                     <AdminDashboard 
                         products={products}
                         onSaveProduct={handleSaveProduct}
                         onDeleteProduct={handleDeleteProduct}
                         onSetProducts={handleBulkUpdateProducts}
                         siteConfig={siteConfig}
                         onSiteConfigUpdate={handleSiteConfigUpdate}
                         onUpdateLogo={handleUpdateLogo}
                     />
                 </div>
             </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            {isAdmin && <AdminToolbar onLogout={handleLogout} onToggleView={() => setAdminView('dashboard')} currentView="site" />}

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
                    <InfoSection features={infoFeatures} />
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
                            onAddToCart={(product) => handleAddToCart(product, 1, null)}
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
                onAdminClick={() => setIsLoginModalOpen(true)}
            />

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
        </div>
    );
}

export default App;