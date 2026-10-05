import elfBannerCutout from "./assets/products/elf-tinted-lip-oil-stick-cutout.png";
import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import {
  Product,
  Slide,
  FaqItem,
  SiteConfig,
  CartItem,
  ProductVariant,
} from "./types";
import { useLocalStorage } from "./hooks/useLocalStorage";
import {
  LOGO_DATA_URI,
  FAQS as INITIAL_FAQS,
} from "./constants";
import { supabase, isSupabaseConfigured } from "./supabaseClient";

import { loadMetadata, styleClient } from "./features/style/data";
import { type Metadata } from "./features/style/engine";

import StylePreview from "./features/style/StylePreview";

// Components
import Header from "./components/Header";
import HeroSlider from "./components/HeroSlider";
import ProductGrid from "./components/ProductGrid";
import FaqSection from "./components/FaqSection";
import Footer from "./components/Footer";
import {
  CatalogPage,
  CategoriesPage,
  NotFoundPage,
} from "./components/StorePages";
import { useStoreRouter } from "./hooks/useStoreRouter";
import { categoryPath, productPath, slugify } from "./lib/routes";
import SpinnerIcon from "./components/icons/SpinnerIcon";
import {
  QuickCategories,
  HowToBuy,
  EditorialBanner,
} from "./components/BeautySections";
import BeautyIcon from "./components/icons/BeautyIcon";

// Lazy-loaded Components
const StyleQuiz = lazy(() => import("./features/style/StyleQuiz"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const ProductDetail = lazy(() => import("./components/ProductDetail"));
const CartModal = lazy(() => import("./components/CartModal"));
const SliderEditModal = lazy(() => import("./components/SliderEditModal"));
const LoginModal = lazy(() => import("./components/LoginModal"));
const AdminToolbar = lazy(() => import("./components/AdminToolbar"));

const INITIAL_SITE_CONFIG: SiteConfig = {
  id: 1,
  site_name: "Makeup Glamours",
  logo: LOGO_DATA_URI,
  phone_number: "50375771383",
  instagram_url: "https://instagram.com",
  slider_speed: 4000,
  show_sold_out: true,
  created_at: new Date().toISOString(),
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
  if (error && typeof error === "object") {
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
  const bucketName = "product-images";
  if (
    !bucketName ||
    !url ||
    url.startsWith("data:") ||
    url.includes("via.placeholder.com")
  ) {
    return "";
  }
  try {
    const urlObject = new URL(url);
    const pathSegments = urlObject.pathname.split("/");
    const bucketIndex = pathSegments.indexOf(bucketName);
    if (bucketIndex === -1 || bucketIndex === pathSegments.length - 1) {
      console.warn(`Could not extract path from URL: ${url}`);
      return "";
    }
    const path = pathSegments.slice(bucketIndex + 1).join("/");
    return decodeURIComponent(path);
  } catch (error) {
    console.error(
      "Invalid URL provided to getPathFromSupabaseUrl:",
      url,
      error,
    );
    return "";
  }
};

function App() {
  const { location, route, navigate, onLinkClick } = useStoreRouter();
  const [isAdmin, setIsAdmin] = useLocalStorage("isAdmin", false);
  const [adminView, setAdminView] = useState<"site" | "dashboard">("site");
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<
    Record<string, Metadata>
  >({});
  const [recommendationError, setRecommendationError] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [faqs] = useState<FaqItem[]>(INITIAL_FAQS);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(INITIAL_SITE_CONFIG);
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>("cart", []);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isSliderEditModalOpen, setIsSliderEditModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const selectedCategory =
    route.kind === "category"
      ? products.find((p) => slugify(p.category) === route.slug)?.category || ""
      : "Todos";
  const searchQuery = new URLSearchParams(location.search).get("q") || "";
  const selectedProduct =
    route.kind === "product"
      ? products.find((p) => p.id === route.id) || null
      : null;
  const setSelectedCategory = (category: string) =>
    navigate(category === "Todos" ? "/tienda" : categoryPath(category));
  const setSearchQuery = (query: string) => {
    const params = new URLSearchParams(location.search);
    if (query) params.set("q", query);
    else params.delete("q");
    const search = params.toString();
    navigate(location.pathname + (search ? "?" + search : ""), true);
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const categories = ["Todos", ...new Set(products.map((p) => p.category))];

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (!siteConfig.show_sold_out) {
      filtered = filtered.filter((p) => {
        const totalStock =
          p.variants?.length > 0
            ? p.variants.reduce((sum, v) => sum + v.stock, 0)
            : p.stock;
        return totalStock > 0;
      });
    }

    if (selectedCategory !== "Todos") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery, siteConfig.show_sold_out]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsRes, slidesRes, siteConfigRes] = await Promise.all([
          supabase
            .from("products")
            .select("*, variants:product_variants(*)")
            .order("created_at", { ascending: false }),
          supabase
            .from("hero_slides")
            .select("*")
            .order("order", { ascending: true }),
          supabase.from("site_config").select("*").limit(1).single(),
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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    loadMetadata()
      .then(setRecommendations)
      .catch(() =>
        setRecommendationError(
          "No pudimos cargar el asesor. Puedes seguir comprando en la tienda.",
        ),
      );
  }, []);

  const handleProductClick = (product: Product) =>
    navigate(productPath(product));
  const handleBackToHome = () =>
    navigate(
      selectedProduct ? categoryPath(selectedProduct.category) : "/tienda",
    );

  const handleAddToCart = (
    product: Product,
    quantity: number = 1,
    selectedVariant: ProductVariant | null = null,
  ) => {
    setCartItems((prevItems) => {
      const cartItemId = selectedVariant
        ? `${product.id}-${selectedVariant.id}`
        : `${product.id}-base`;
      const existingItem = prevItems.find((item) => item.id === cartItemId);

      const itemStock = selectedVariant ? selectedVariant.stock : product.stock;
      const variantName = selectedVariant ? selectedVariant.name : null;
      const itemImage =
        selectedVariant?.image_url ||
        product.image_url?.split(",")[0]?.trim() ||
        "";

      const currentQuantityInCart = existingItem?.quantity || 0;
      const availableStock = itemStock - currentQuantityInCart;
      if (availableStock <= 0) {
        console.log("No more stock available for this item.");
        return prevItems;
      }

      const quantityToAdd = Math.min(quantity, availableStock);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item,
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
    const itemInCart = cartItems.find((i) => i.id === cartItemId);
    if (!itemInCart) return;

    if (quantity <= 0) {
      handleRemoveFromCart(cartItemId);
    } else {
      const newQuantity = Math.min(quantity, itemInCart.stock);
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    }
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== cartItemId),
    );
  };

  const handleLogin = () => {
    setIsAdmin(true);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setAdminView("site");
  };

  const handleUpdateSlide = async (
    id: number,
    updatedFields: Partial<Omit<Slide, "id" | "created_at">>,
  ) => {
    setSlides((prev) =>
      prev.map((slide) =>
        slide.id === id ? { ...slide, ...updatedFields } : slide,
      ),
    );
    const { error } = await supabase
      .from("hero_slides")
      .update(updatedFields)
      .eq("id", id);
    if (error) {
      logSupabaseError("Error updating slide", error);
      // NOTE: Consider reverting state on error
    }
  };

  const handleAddSlide = async () => {
    const newSlideData: Omit<Slide, "id" | "created_at"> = {
      title: "Nuevo Título",
      subtitle:
        "Este es un subtítulo de ejemplo para la nueva diapositiva. Haz clic para editar.",
      button_text: "Comprar Ahora",
      button_link: "#",
      image_url: "",
      order: slides.length + 1,
      image_position_x: 50,
      image_position_y: 50,
      content_position: "center",
    };
    const { data, error } = await supabase
      .from("hero_slides")
      .insert(newSlideData)
      .select()
      .single();
    if (error) logSupabaseError("Error adding slide", error);
    else if (data) setSlides((prev) => [...prev, data]);
  };

  const handleDeleteSlide = async (id: number) => {
    const slideToDelete = slides.find((s) => s.id === id);
    if (!slideToDelete) return;

    const bucketName = "product-images";
    const imagePath = getPathFromSupabaseUrl(slideToDelete.image_url);

    if (bucketName && imagePath) {
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([imagePath]);
      if (storageError) {
        logSupabaseError(
          "Error deleting slide image from storage",
          storageError,
        );
        alert(
          `Error al eliminar la imagen de la diapositiva: ${storageError.message}\n\nPor favor, verifica los permisos (RLS) en tu bucket de Supabase.`,
        );
        return;
      }
    }

    const { error } = await supabase.from("hero_slides").delete().eq("id", id);
    if (error) {
      logSupabaseError("Error deleting slide from DB", error);
    } else {
      setSlides((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const refreshProductState = async (productId: string, isNew: boolean) => {
    const { data: refreshedProduct, error } = await supabase
      .from("products")
      .select("*, variants:product_variants(*)")
      .eq("id", productId)
      .single();

    if (error) {
      logSupabaseError("Error refreshing product state", error);
      return;
    }

    if (refreshedProduct) {
      setProducts((prev) => {
        if (isNew) return [refreshedProduct, ...prev];
        return prev.map((p) => (p.id === productId ? refreshedProduct : p));
      });
    }
  };

  const handleSaveProduct = async (
    product: Product,
    variantsToSave: ProductVariant[],
    variantIdsToDelete: string[],
    imagesToDelete: string[],
    recommendation?: Metadata,
  ) => {
    if (recommendation) {
      const { data } = await styleClient.auth.getSession();
      if (data.session?.user.app_metadata?.role !== "admin")
        throw new Error(
          "Conecta la administración de recomendaciones antes de guardar estos cambios.",
        );
    }
    const bucketName = "product-images";
    if (imagesToDelete.length > 0 && bucketName) {
      const pathsToDelete = imagesToDelete
        .map(getPathFromSupabaseUrl)
        .filter(Boolean);
      if (pathsToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove(pathsToDelete);
        if (deleteError) {
          logSupabaseError("Error deleting product images", deleteError);
          alert(
            `Error al eliminar imágenes antiguas: ${deleteError.message}\n\nNo se guardó el producto. Verifica los permisos (RLS) de tu bucket.`,
          );
          throw deleteError;
        }
      }
    }

    const isNewProduct = product.id === "new-product-placeholder";
    const { variants, ...productData } = product;

    let savedProductId: string | null = null;

    if (isNewProduct) {
      const { id, created_at, ...newProductData } = productData;
      const { data, error } = await supabase
        .from("products")
        .insert(newProductData)
        .select("id")
        .single();
      if (error || !data) {
        logSupabaseError("Error creating product", error);
        throw error;
      }
      savedProductId = data.id;
    } else {
      const { id, created_at, ...updateProductData } = productData;
      const { error } = await supabase
        .from("products")
        .update(updateProductData)
        .eq("id", product.id);
      if (error) {
        logSupabaseError("Error updating product", error);
        throw error;
      }
      savedProductId = product.id;
    }

    if (!savedProductId) throw new Error("No se obtuvo el producto guardado.");

    if (variantIdsToDelete.length > 0) {
      const { error } = await supabase
        .from("product_variants")
        .delete()
        .in("id", variantIdsToDelete);
      if (error) logSupabaseError("Error deleting variants", error);
    }

    const variantsWithProductId = variantsToSave.map((v) => ({
      ...v,
      product_id: savedProductId!,
    }));
    if (variantsWithProductId.length > 0) {
      const { error } = await supabase
        .from("product_variants")
        .upsert(variantsWithProductId, { onConflict: "id" });
      if (error) logSupabaseError("Error upserting variants", error);
    }

    if (recommendation) {
      const { error } = await styleClient
        .from("product_recommendations")
        .upsert(
          { ...recommendation, product_id: savedProductId },
          { onConflict: "product_id" },
        );
      if (error) {
        await refreshProductState(savedProductId, isNewProduct);
        throw Object.assign(
          new Error(
            "El producto se guardó, pero no su recomendación. Intenta guardar de nuevo.",
          ),
          { savedProductId },
        );
      }
      setRecommendations((prev) => ({
        ...prev,
        [savedProductId!]: { ...recommendation, product_id: savedProductId! },
      }));
    }
    await refreshProductState(savedProductId, isNewProduct);
  };

  const handleDeleteProduct = async (productToDelete: Product) => {
    const bucketName = "product-images";
    if (!bucketName) {
      alert("El nombre del bucket de Supabase no está configurado.");
      return;
    }

    const mainImageUrls = productToDelete.image_url
      ? productToDelete.image_url.split(",").map((url) => url.trim())
      : [];
    const variantImageUrls =
      productToDelete.variants
        ?.map((v) => v.image_url)
        .filter((url): url is string => !!url) || [];
    const allImageUrls = [...new Set([...mainImageUrls, ...variantImageUrls])];
    const pathsToDelete = allImageUrls
      .map(getPathFromSupabaseUrl)
      .filter(Boolean);

    if (pathsToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove(pathsToDelete);
      if (deleteError) {
        logSupabaseError(
          "Error deleting product images from storage",
          deleteError,
        );
        alert(
          `Error al eliminar imágenes del producto: ${deleteError.message}\n\nVerifica los permisos (RLS) en tu bucket de Supabase.`,
        );
        return;
      }
    }

    if (productToDelete.variants && productToDelete.variants.length > 0) {
      const variantIds = productToDelete.variants.map((v) => v.id);
      const { error: variantError } = await supabase
        .from("product_variants")
        .delete()
        .in("id", variantIds);
      if (variantError) {
        logSupabaseError("Error deleting product variants", variantError);
        alert(`Error al eliminar variantes: ${variantError.message}`);
        return;
      }
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productToDelete.id);
    if (error) {
      logSupabaseError("Error deleting product", error);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
    }
  };

  const handleSiteConfigUpdate = async (config: Partial<SiteConfig>) => {
    const bucketName = "product-images";
    if (!bucketName) {
      alert("El nombre del bucket de Supabase no está configurado.");
      return;
    }

    if (config.logo && config.logo !== siteConfig.logo) {
      const oldLogoPath = getPathFromSupabaseUrl(siteConfig.logo);
      if (oldLogoPath) {
        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove([oldLogoPath]);
        if (deleteError) {
          logSupabaseError("Failed to delete old logo", deleteError);
          alert(
            `No se pudo eliminar el logo antiguo: ${deleteError.message}\n\nVerifica los permisos (RLS) en tu bucket.`,
          );
          return;
        }
      }
    }

    const newConfig = { ...siteConfig, ...config };
    const { error } = await supabase
      .from("site_config")
      .update(config)
      .eq("id", siteConfig.id);
    if (error) logSupabaseError("Error updating site config", error);
    else setSiteConfig(newConfig);
  };

  const handleUpdateSlideImage = async (slideId: number, file: File) => {
    const slideToUpdate = slides.find((s) => s.id === slideId);
    if (!slideToUpdate) throw new Error("Diapositiva no encontrada");

    const bucketName = "product-images";
    if (!bucketName)
      throw new Error("El nombre del bucket de Supabase no está configurado.");

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `public/slides/${Date.now()}-${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);
    if (uploadError) {
      logSupabaseError("Error uploading new slide image", uploadError);
      alert(`Error al subir la nueva imagen: ${uploadError.message}`);
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    const newImageUrl = publicUrlData.publicUrl;

    const oldImagePath = getPathFromSupabaseUrl(slideToUpdate.image_url);
    if (oldImagePath) {
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([oldImagePath]);
      if (deleteError) {
        logSupabaseError("Failed to delete old slide image", deleteError);
        alert(
          `Advertencia: No se pudo eliminar la imagen antigua: ${deleteError.message}`,
        );
      }
    }

    await handleUpdateSlide(slideId, { image_url: newImageUrl });
  };

  const isProductPage = route.kind === "product";
  const visibleProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          siteConfig.show_sold_out ||
          (p.variants?.length
            ? p.variants.reduce((sum, v) => sum + v.stock, 0)
            : p.stock) > 0,
      ),
    [products, siteConfig.show_sold_out],
  );
  const newestProducts = useMemo(
    () =>
      [...visibleProducts]
        .filter((p) => Number.isFinite(Date.parse(p.created_at)))
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
        .slice(0, 4),
    [visibleProducts],
  );
  const favorites = visibleProducts
    .filter(
      (p) =>
        (p.variants?.length
          ? p.variants.reduce((sum, v) => sum + v.stock, 0)
          : p.stock) > 0,
    )
    .slice(0, 4);
  const navigateToSection = (section: string, search = false) => {
    const target =
      (
        {
          home: "/",
          products: "/tienda",
          categories: "/categorias",
          "new-arrivals": "/novedades",
          style: "/encuentra-tu-estilo",
        } as Record<string, string>
      )[section] || "/tienda";
    navigate(target);
    if (search)
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          document
            .getElementById("product-search")
            ?.focus({ preventScroll: true }),
        ),
      );
  };
  const missingRoute =
    route.kind === "notFound" ||
    (route.kind === "product" && !selectedProduct) ||
    (route.kind === "category" && !selectedCategory);
  const pageTitle = missingRoute
    ? "Página no encontrada"
    : selectedProduct
      ? selectedProduct.name
      : route.kind === "category"
        ? selectedCategory
        : route.kind === "shop"
          ? "Tienda"
          : route.kind === "categories"
            ? "Categorías"
            : route.kind === "style"
              ? "Encuentra tu estilo"
              : route.kind === "new"
                ? "Novedades"
                : "";
  useEffect(() => {
    if (isLoading) return;
    const title = pageTitle
      ? `${pageTitle} | ${siteConfig.site_name}`
      : `${siteConfig.site_name} | Maquillaje y belleza en El Salvador`;
    const description =
      selectedProduct?.description ||
      (selectedCategory !== "Todos" && selectedCategory
        ? `Descubre ${selectedCategory.toLowerCase()} en Makeup Glamours. Elige tus favoritos y coordina tu pedido por WhatsApp.`
        : "Descubre tus favoritos de maquillaje y cuidado personal. Explora la tienda y coordina tu pedido por WhatsApp.");
    document.title = title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[property="og:image"]')
      ?.setAttribute(
        "content",
        selectedProduct?.image_url.split(",")[0]?.trim() || siteConfig.logo,
      );
    const canonical =
      document.querySelector<HTMLLinkElement>('link[rel="canonical"]') ||
      document.head.appendChild(
        Object.assign(document.createElement("link"), { rel: "canonical" }),
      );
    const canonicalPath = selectedProduct
      ? productPath(selectedProduct)
      : location.pathname.replace(/\/+$/, "");
    canonical.href =
      window.location.origin + (canonicalPath ? canonicalPath + "/" : "/");
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute("content", canonical.href);
    const oldSchema = document.getElementById("product-schema");
    oldSchema?.remove();
    if (selectedProduct) {
      const schema = document.createElement("script");
      schema.id = "product-schema";
      schema.type = "application/ld+json";
      const totalStock = selectedProduct.variants?.length
        ? selectedProduct.variants.reduce((sum, v) => sum + v.stock, 0)
        : selectedProduct.stock;
      schema.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: selectedProduct.name,
        description: selectedProduct.description,
        image: selectedProduct.image_url
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        sku: selectedProduct.id,
        offers: {
          "@type": "Offer",
          url: canonical.href,
          priceCurrency: "USD",
          price: selectedProduct.price.toFixed(2),
          availability:
            totalStock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
        },
      });
      document.head.appendChild(schema);
    }
    document.querySelector('meta[name="robots"]')?.remove();
    if (missingRoute) {
      const robots = document.createElement("meta");
      robots.name = "robots";
      robots.content = "noindex";
      document.head.appendChild(robots);
    }
  }, [
    isLoading,
    missingRoute,
    pageTitle,
    selectedProduct,
    selectedCategory,
    siteConfig.site_name,
    siteConfig.logo,
    location.pathname,
  ]);
  useEffect(() => {
    // Preserve old shared section links from the single-page catalog.
    if (
      location.pathname === "/" &&
      [
        "#products",
        "#products-category",
        "#categories",
        "#new-arrivals",
      ].includes(window.location.hash)
    ) {
      navigate(
        window.location.hash === "#categories"
          ? "/categorias"
          : window.location.hash === "#new-arrivals"
            ? "/novedades"
            : "/tienda",
        true,
      );
    }
  }, [location.pathname, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Configuración Requerida
          </h1>
          <p className="text-gray-600 mb-6">
            Para que la aplicación funcione, necesitas configurar las variables
            de entorno de Supabase.
          </p>
          <div className="text-left bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <p className="text-sm font-mono text-gray-800 break-all">
              VITE_SUPABASE_URL
              <br />
              VITE_SUPABASE_ANON_KEY
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Añade estas variables en tu archivo{" "}
            <code className="bg-gray-100 px-1 rounded">.env</code> y reinicia el
            servidor.
          </p>
        </div>
      </div>
    );
  }

  if (isAdmin && adminView === "dashboard") {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <div className="bg-gray-100 min-h-screen">
          <AdminToolbar
            onLogout={handleLogout}
            onToggleView={() => setAdminView("site")}
            currentView="dashboard"
          />
          <div className="pt-12 sm:pt-12">
            <AdminDashboard
              products={products}
              onSaveProduct={handleSaveProduct}
              recommendations={recommendations}
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
    <div className="storefront min-h-screen font-sans" onClick={onLinkClick}>
      <a href="#main-content" className="skip-link">
        Saltar al catálogo
      </a>
      {isAdmin && (
        <Suspense fallback={null}>
          <AdminToolbar
            onLogout={handleLogout}
            onToggleView={() => setAdminView("dashboard")}
            currentView="site"
          />
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
        onNavigate={navigateToSection}
      />

      {route.kind === "home" && (
        <main id="main-content">
          <HeroSlider
            slides={slides}
            isAdmin={isAdmin}
            onUpdate={handleUpdateSlide}
            sliderSpeed={siteConfig.slider_speed}
            onOpenSliderEditor={() => setIsSliderEditModalOpen(true)}
            fallbackImage={visibleProducts[0]?.image_url?.split(",")[0]?.trim()}
          />
          <QuickCategories
            products={visibleProducts}
            categories={categories}
            onSelect={setSelectedCategory}
          />
          {favorites.length > 0 && (
            <section className="shop-shell favorites-section">
              <div className="section-heading">
                <div>
                  <h2>
                    Nuestros favoritos{" "}
                    <BeautyIcon kind="heart" className="heading-heart" />
                  </h2>
                </div>
                <a className="text-link" href="/tienda">
                  Explorar todos <BeautyIcon kind="arrow" className="h-4 w-4" />
                </a>
              </div>
              <ProductGrid
                cartItems={cartItems}
                products={favorites}
                onProductClick={handleProductClick}
                onAddToCart={(product) => handleAddToCart(product, 1, null)}
              />
            </section>
          )}
          <section className="shop-shell style-home">
            <div className="style-home-copy">
              <h2>Encuentra tu estilo</h2>
              <p>Un look para ti, con productos de nuestra tienda.</p>
              <a href="/encuentra-tu-estilo" className="primary-button">
                Crear mi look <BeautyIcon kind="arrow" className="h-4 w-4" />
              </a>
            </div>
            <StylePreview products={products} metadata={recommendations} />
          </section>
          <HowToBuy />
          <EditorialBanner
            image={
              visibleProducts
                .find((p) => p.id === "77d5434d-e0c4-4a4d-93c5-e9992c53a0f5")
                ?.image_url.split(",")[0]
                ?.trim()
                .endsWith("/1782767198252-Vine_Shine.avif")
                ? elfBannerCutout
                : visibleProducts
                    .find((p) => p.category === "Labios" && p.image_url)
                    ?.image_url.split(",")[0]
                    ?.trim()
            }
          />
          {newestProducts.length > 0 && (
            <section id="new-arrivals" className="shop-shell arrivals-section">
              <div className="section-heading">
                <div>
                  <h2>Recién llegados</h2>
                </div>
                <a href="/tienda" className="text-link">
                  Ver todos <BeautyIcon kind="arrow" className="h-4 w-4" />
                </a>
              </div>
              <ProductGrid
                cartItems={cartItems}
                products={newestProducts}
                onProductClick={handleProductClick}
                onAddToCart={(product) => handleAddToCart(product, 1, null)}
              />
            </section>
          )}
          <FaqSection faqs={faqs} />
        </main>
      )}

      {(route.kind === "shop" ||
        route.kind === "category" ||
        route.kind === "new") &&
        !missingRoute && (
          <CatalogPage
            title={
              route.kind === "category"
                ? selectedCategory
                : route.kind === "new"
                  ? "Recién llegados"
                  : "Nuestra tienda"
            }
            description={
              route.kind === "category"
                ? "Explora esta selección y encuentra lo que va contigo."
                : route.kind === "new"
                  ? "Los últimos productos que llegaron a nuestra tienda."
                  : "Maquillaje y cuidado personal. Todos tus favoritos, en un solo lugar."
            }
            eyebrow={
              route.kind === "category"
                ? "UN FAVORITO PARA CADA MOMENTO"
                : "TU BELLEZA, A TU MANERA"
            }
            products={
              route.kind === "new"
                ? [...filteredProducts]
                    .filter((p) => Number.isFinite(Date.parse(p.created_at)))
                    .sort(
                      (a, b) =>
                        Date.parse(b.created_at) - Date.parse(a.created_at),
                    )
                : filteredProducts
            }
            categories={categories}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onSelectCategory={setSelectedCategory}
            onSearchChange={setSearchQuery}
            cartItems={cartItems}
            onProductClick={handleProductClick}
            onAddToCart={(product) => handleAddToCart(product, 1, null)}
          />
        )}
      {route.kind === "style" && (
        <Suspense fallback={<LoadingSpinner />}>
          <StyleQuiz
            products={products}
            metadata={recommendations}
            error={recommendationError}
            onAdd={handleAddToCart}
            onCart={() => setIsCartModalOpen(true)}
            cartItems={cartItems}
          />
        </Suspense>
      )}
      {route.kind === "categories" && (
        <CategoriesPage products={visibleProducts} categories={categories} />
      )}
      {missingRoute && <NotFoundPage />}

      {isProductPage && selectedProduct && (
        <Suspense fallback={<LoadingSpinner />}>
          <ProductDetail
            key={selectedProduct.id}
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
            onSpeedChange={(speed) =>
              handleSiteConfigUpdate({ slider_speed: speed })
            }
            onAddSlide={handleAddSlide}
            onUpdateSlide={handleUpdateSlide}
            onDeleteSlide={handleDeleteSlide}
            onUpdateSlideImage={handleUpdateSlideImage}
          />
        )}
      </Suspense>
    </div>
  );
}

export default App;
