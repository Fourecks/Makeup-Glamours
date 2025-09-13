import { Product, Slide, FaqItem, InfoFeature } from './types';

export const LOGO_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAA5HSURBVHgB7d1NbBtXFAfw7x/2Yy92YgeCJEmQoEMBBQIHBtCDRAZERAQIEiRIkGCDjgqSBDWwoSEBHTQIHGihgQRIkCBxggQJ/AwBBVK/d77r/P74fr6uu7e615eP15t7d2dnZ3d2d3d3d2cGANgJvLu7O/9/B2sBAMh/7O7uzukBAMg5d3d3fgAAMuTu7s68u7u7+umnn+7u7s77AMCQe3d3Z9YG9wBgI+7u7s6YAwDMBLu7uzNjAwAzgbu7uzP2ACAzge7u7sw/AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC-7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC.../AAAAAElFTkSuQmCC';

export const SLIDES: Slide[] = [];

export const PRODUCTS: Product[] = [];

export const FAQS: FaqItem[] = [
  // FIX: Added missing `order` and `created_at` properties.
  {
    id: 1,
    question: '¿Sus productos son libres de crueldad animal?',
    answer: 'Sí, todos nuestros productos son 100% libres de crueldad. Estamos certificados por Leaping Bunny y no realizamos pruebas en animales en ninguna etapa del desarrollo del producto.',
    order: null,
    created_at: new Date().toISOString(),
  },
  // FIX: Added missing `order` and `created_at` properties.
  {
    id: 2,
    question: '¿Cuál es su política de devoluciones?',
    answer: 'Ofrecemos una garantía de satisfacción de 30 días. Si no estás contento/a con tu compra, puedes devolverla para obtener un reembolso completo o un cambio. Por favor, visita nuestra página de devoluciones para más detalles.',
    order: null,
    created_at: new Date().toISOString(),
  },
  // FIX: Added missing `order` and `created_at` properties.
  {
    id: 3,
    question: '¿Realizan envíos internacionales?',
    answer: 'Sí, enviamos a la mayoría de los países del mundo. Los costos de envío y los tiempos de entrega varían según la ubicación. Puedes ver los detalles específicos al finalizar la compra.',
    order: null,
    created_at: new Date().toISOString(),
  },
  // FIX: Added missing `order` and `created_at` properties.
  {
    id: 4,
    question: '¿Sus productos son veganos?',
    answer: 'La mayoría de nuestros productos son veganos. Puedes encontrar una lista completa de ingredientes en cada página de producto. Busca el símbolo vegano para identificarlos fácilmente.',
    order: null,
    created_at: new Date().toISOString(),
  },
];

export const INFO_FEATURES: InfoFeature[] = [
    { id: 1, icon: '✨', title: 'Calidad Premium', description: 'Ingredientes de la más alta calidad para resultados increíbles.' },
    { id: 2, icon: '🐰', title: 'Cruelty-Free', description: 'Nunca probamos nuestros productos en animales.' },
    { id: 3, icon: '🌿', title: 'Ingredientes Naturales', description: 'Belleza que es buena para ti y para el planeta.' },
    { id: 4, icon: '🚚', title: 'Envío Rápido', description: 'Recibe tus productos favoritos en la puerta de tu casa.' },
];

export const CATEGORIES = ['Todos', ...new Set(PRODUCTS.map(p => p.category))];