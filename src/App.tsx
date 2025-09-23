import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
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
import CategoryFilter from './components/CategoryFilter';
import InfoSection from './components/InfoSection';
import SpinnerIcon from './components/icons/SpinnerIcon';

// Lazy-loaded Components
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const ProductDetail = lazy(() => import('./components/ProductDetail'));
const CartModal = lazy(() => import('./components/CartModal'));
const SliderEditModal = lazy(() => import('./components/SliderEditModal'));
const LoginModal = lazy(() => import('./components/LoginModal'));
const AdminToolbar = lazy(() => import('./components/AdminToolbar'));


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

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
            <SpinnerIcon className="h-12 w-12 text-brand-pink animate-spin mx-auto" />
            <p className="mt-4 text-lg text-gray-600">Cargando...</p>
        </div>
    </div>
);

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

const getPathFromSupabaseUrl = (url: string): string => {
    const bucketName = import.meta.env.VITE_SUPABASE_BUCKET;
    if (!bucketName || !url || url.startsWith('data:') || url.includes('via.placeholder.com')) {
        return '';
    }
    try {
        const urlObject = new URL(url);
        const pathSegments = urlObject.pathname.split('/');
        const bucketIndex = pathSegments.indexOf(bucketName);
        if (bucketIndex === -1 || bucketIndex === pathSegments.length - 1) {
            console.warn(`Could not extract path from URL: ${url}`);
            return '';
        }
        const path = pathSegments.slice(bucketIndex + 1).join('/');
        return decodeURIComponent(path);
    } catch (error) {
        console.error('Invalid URL provided to getPathFromSupabaseUrl:', url, error);
        return '';
    }
};

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
                const [productsRes, slidesRes, siteConfigRes] = await Promise.all([
                    supabase.from('products').select('*, variants:product_variants(*)').order('created_at', { ascending: false }),
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
                console.log("No more stock available for this item.");
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
        const slideToDelete = slides.find(s => s.id === id);
        if (!slideToDelete) return;

        const bucketName = import.meta.env.VITE_SUPABASE_BUCKET;
        const imagePath = getPathFromSupabaseUrl(slideToDelete.image_url);

        if (bucketName && imagePath) {
            const { error: storageError } = await supabase.storage.from(bucketName).remove([imagePath]);
            if (storageError) {
                logSupabaseError('Error deleting slide image from storage', storageError);
                alert(`Error al eliminar la imagen de la diapositiva: ${storageError.message}\n\nPor favor, verifica los permisos (RLS) en tu bucket de Supabase.`);
                return;
            }
        }

        const { error } = await supabase.from('hero_slides').delete().eq('id', id);
        if (error) {
            logSupabaseError('Error deleting slide from DB', error);
        } else {
            setSlides(prev => prev.filter(s => s.id !== id));
        }
    };
    
    const refreshProductState = async (productId: string, isNew: boolean) => {
        const { data: refreshedProduct, error } = await supabase
            .from('products')
            .select('*, variants:product_variants(*)')
            .eq('id', productId)
            .single();

        if (error) {
            logSupabaseError('Error refreshing product state', error);
            return;
        }

        if (refreshedProduct) {
            setProducts(prev => {
                if (isNew) return [refreshedProduct, ...prev];
                return prev.map(p => p.id === productId ? refreshedProduct : p);
            });
        }
    };

    const handleSaveProduct = async (product: Product, variantsToSave: ProductVariant[], variantIdsToDelete: string[], imagesToDelete: string[]) => {
        const bucketName = import.meta.env.VITE_SUPABASE_BUCKET;
        if (imagesToDelete.length > 0 && bucketName) {
            const pathsToDelete = imagesToDelete.map(getPathFromSupabaseUrl).filter(Boolean);
            if (pathsToDelete.length > 0) {
                const { error: deleteError } = await supabase.storage.from(bucketName).remove(pathsToDelete);
                if (deleteError) {
                    logSupabaseError('Error deleting product images', deleteError);
                    alert(`Error al eliminar imágenes antiguas: ${deleteError.message}\n\nNo se guardó el producto. Verifica los permisos (RLS) de tu bucket.`);
                    return;
                }
            }
        }
    
        const isNewProduct = product.id === 'new-product-placeholder';
        const { variants, ...productData } = product;
    
        let savedProductId: string | null = null;
    
        if (isNewProduct) {
            const { id, created_at, ...newProductData } = productData;
            const { data, error } = await supabase.from('products').insert(newProductData).select('id').single();
            if (error || !data) {
                logSupabaseError('Error creating product', error);
                return;
            }
            savedProductId = data.id;
        } else {
            const { id, created_at, ...updateProductData } = productData;
            const { error } = await supabase.from('products').update(updateProductData).eq('id', product.id);
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
    
        const variantsWithProductId = variantsToSave.map(v => ({ ...v, product_id: savedProductId! }));
        if (variantsWithProductId.length > 0) {
            const variantsToUpsert = variantsWithProductId.map(v => {
                if (typeof v.id === 'string' && v.id.startsWith('new-')) {
                    const { id, ...rest } = v;
                    return rest;
                }
                return v;
            });
            const { error } = await supabase.from('product_variants').upsert(variantsToUpsert, { onConflict: 'id' });
            if (error) logSupabaseError('Error upserting variants', error);
        }
    
        await refreshProductState(savedProductId, isNewProduct);
    };
    
    const handleDeleteProduct = async (productToDelete: Product) => {
        const bucketName = import.meta.env.VITE_SUPABASE_BUCKET;
        if (!bucketName) {
            alert('Supabase bucket name is not configured.');
            return;
        }

        const mainImageUrls = productToDelete.image_url ? productToDelete.image_url.split(',').map(url => url.trim()) : [];
        const variantImageUrls = productToDelete.variants?.map(v => v.image_url).filter((url): url is string => !!url) || [];
        const allImageUrls = [...new Set([...mainImageUrls, ...variantImageUrls])];
        const pathsToDelete = allImageUrls.map(getPathFromSupabaseUrl).filter(Boolean);

        if (pathsToDelete.length > 0) {
            const { error: deleteError } = await supabase.storage.from(bucketName).remove(pathsToDelete);
            if (deleteError) {
                logSupabaseError('Error deleting product images from storage', deleteError);
                alert(`Error al eliminar imágenes del producto: ${deleteError.message}\n\nVerifica los permisos (RLS) en tu bucket de Supabase.`);
                return;
            }
        }

        if (productToDelete.variants && productToDelete.variants.length > 0) {
            const variantIds = productToDelete.variants.map(v => v.id);
            const { error: variantError } = await supabase.from('product_variants').delete().in('id', variantIds);
            if (variantError) {
                logSupabaseError('Error deleting product variants', variantError);
                alert(`Error deleting variants: ${variantError.message}`);
                return;
            }
        }
        
        const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
        if (error) {
            logSupabaseError('Error deleting product', error);
        }
        else {
            setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
        }
    };

    const handleSiteConfigUpdate = async (config: Partial<SiteConfig>) => {
        const bucketName = import.meta.env.VITE_SUPABASE_BUCKET;
        if (!bucketName) {
            alert("Supabase bucket name not configured.");
            return;
        }
    
        if (config.logo && config.logo !== siteConfig.logo) {
            const oldLogoPath = getPathFromSupabaseUrl(siteConfig.logo);
            if (oldLogoPath) {
                const { error: deleteError } = await supabase.storage.from(bucketName).remove([oldLogoPath]);
                if (deleteError) {
                    logSupabaseError('Failed to delete old logo', deleteError);
                    alert(`No se pudo eliminar el logo antiguo: ${deleteError.message}\n\nVerifica los permisos (RLS) en tu bucket.`);
                    return; 
                }
            }
        }
    
        const newConfig = {...siteConfig, ...config};
        const { error } = await supabase.from('site_config').update(config).eq('id', siteConfig.id);
        if(error) logSupabaseError('Error updating site config', error);
        else setSiteConfig(newConfig);
    };

    const handleUpdateSlideImage = async (slideId: number, file: File) => {
        const slideToUpdate = slides.find(s => s.id === slideId);
        if (!slideToUpdate) throw new Error("Slide not found");
    
        const bucketName = import.meta.env.VITE_SUPABASE_BUCKET;
        if (!bucketName) throw new Error("Supabase bucket name not configured.");
        
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `public/slides/${Date.now()}-${cleanFileName}`;
    
        const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file);
        if (uploadError) {
            logSupabaseError("Error uploading new slide image", uploadError);
            alert(`Error al subir la nueva imagen: ${uploadError.message}`);
            throw uploadError;
        }
        
        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        const newImageUrl = publicUrlData.publicUrl;
    
        const oldImagePath = getPathFromSupabaseUrl(slideToUpdate.image_url);
        if (oldImagePath) {
            const { error: deleteError } = await supabase.storage.from(bucketName).remove([oldImagePath]);
            if (deleteError) {
                logSupabaseError('Failed to delete old slide image', deleteError);
                // Non-critical, so we can proceed but should warn the user.
                alert(`Advertencia: No se pudo eliminar la imagen antigua: ${deleteError.message}`);
            }
        }
        
        const { error: dbError } = await supabase.from('hero_slides').update({ image_url: newImageUrl }).eq('id', slideId);
        
        if (dbError) {
            logSupabaseError("Error updating slide image in DB", dbError);
            await supabase.storage.from(bucketName).remove([filePath]); // Clean up uploaded file
            throw dbError;
        }
    
        setSlides(prevSlides => 
            prevSlides.map(s => s.id === slideId ? { ...s, image_url: newImageUrl } : s)
        );
    };

    const isProductPage = currentView === 'productDetail';

    if (isLoading) {
        return <LoadingSpinner />;
    }
    
    if (isAdmin && adminView === 'dashboard') {
        return (
             <Suspense fallback={<LoadingSpinner />}>
                 <div className="bg-gray-100 min-h-screen">
                     <AdminToolbar onLogout={handleLogout} onToggleView={() => setAdminView('site')} currentView="dashboard" />
                     <div className="pt-12 sm:pt-12">
                         <AdminDashboard 
                             products={products}
                             onSaveProduct={handleSaveProduct}
                             onDeleteProduct={handleDeleteProduct}
                             siteConfig={siteConfig}
                             onSiteConfigUpdate={handleSiteConfigUpdate}
                         />
                     </div>
                 </div>
             </Suspense>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            {isAdmin && (
                <Suspense fallback={null}>
                    <AdminToolbar onLogout={handleLogout} onToggleView={() => setAdminView('dashboard')} currentView="site" />
                </Suspense>
            )}

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
                <Suspense fallback={<LoadingSpinner />}>
                    <ProductDetail
                        product={selectedProduct}
                        onBack={handleBackToHome}
                        onAddToCart={handleAddToCart}
                        isAdmin={isAdmin}
                        cartItems={cartItems}
                    />
                </Suspense>
            )}
            
            <Footer
                siteName={siteConfig.site_name}
                logo={siteConfig.logo}
                phoneNumber={siteConfig.phone_number}
                instagramUrl={siteConfig.instagram_url}
                onAdminClick={() => setIsLoginModalOpen(true)}
            />

            <Suspense fallback={null}>
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
                        onUpdateSlideImage={handleUpdateSlideImage}
                    />
                )}
            </Suspense>
        </div>
    );
}

export default App;
