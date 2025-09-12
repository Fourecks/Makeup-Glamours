
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  stock: number;
  created_at: string;
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
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  order: number | null;
  created_at: string;
}

// FIX: Added missing InfoFeature interface.
export interface InfoFeature {
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

export interface CartItem extends Product {
  quantity: number;
}