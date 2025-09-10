export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  images: { image: string }[] | string[]; // Allow both for compatibility
  stock: number;
}

export interface Slide {
  id: number;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface InfoFeature {
  icon: string;
  title: string;
  description: string;
}
