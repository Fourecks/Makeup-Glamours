export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  stock: number;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image_url: string;
  stock: number; // Stock for product if it has NO variants
  created_at: string;
  variants: ProductVariant[];
}

export interface Slide {
  id: number;
  title: string | null;
  subtitle: string | null;
  button_text: string | null;
  button_link: string | null;
  image_url: string;
  order: number | null;
  created_at: string;
  image_position_x: number | null;
  image_position_y: number | null;
  text_position_x: number | null;
  text_position_y: number | null;
  button_position_x: number | null;
  button_position_y: number | null;
  text_align: 'left' | 'center' | 'right' | null;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  order: number | null;
  created_at: string;
}

export interface InfoFeature {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export interface SiteConfig {
  id: number;
  site_name: string;
  logo: string;
  phone_number: string;
  instagram_url: string;
  slider_speed: number;
  show_sold_out: boolean;
  created_at: string;
}

export interface CartItem {
  id: string; // composite key: `${productId}-${variantId || 'base'}`
  productId: string;
  productName: string;
  variantId: string | null; // null for base product without variants
  variantName: string | null;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number; // The stock for this specific variant or base product
}