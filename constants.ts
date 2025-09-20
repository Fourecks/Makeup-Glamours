import { Product, Slide, FaqItem, InfoFeature } from './types';

export const LOGO_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAA5HSURBVHgB7d1NbBtXFAfw7x/2Yy92YgeCJEmQoEMBBQIHBtCDRAZERAQIEiRIkGCDjgqSBDWwoSEBHTQIHGihgQRIkCBxggQJ/AwBBVK/d77r/P74fr6uu7e615eP15t7d2dnZ3d2d3d3d2cGANgJvLu7O/9/B2sBAMh/7O7uzukBAMg5d3d3fgAAMuTu7s68u7u7+umnn+7u7s77AMCQe3d3Z9YG9wBgI+7u7s6YAwDMBLu7uzNjAwAzgbu7uzP2ACAzge7u7sw/AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC.../AAAAAElFTkSuQmCC';

export const SLIDES: Slide[] = [];

export const PRODUCTS: Product[] = [];

export const FAQS: FaqItem[] = [
  // FIX: Added missing `order` and `created_at` properties.
  {
    id: 1,
    question: '¿Realizan envíos departamentales?',
    answer: 'Si, enviamos a la mayoría de departamentos. Los costos de envio, peso del paquete y los tiempos de entrega varían según la ubicación.',
    order: null,
    created_at: new Date().toISOString(),
  },
  // FIX: Added missing `order` and `created_at` properties.
  {
    id: 2,
    question: '¿Como se realizan mis envíos departamentales?',
    answer: 'Su pedido será procesado en 1 día hábil y será transportado mediante Correos El Salvador en un plazo de 3 a 4 días hábiles para su correspondiente entrega al domicilio o ubicación de trabajo proporcionado.',
    order: null,
    created_at: new Date().toISOString(),
  },
  // FIX: Added missing `order` and `created_at` properties.
  {
    id: 3,
    question: '¿Aceptan devoluciones?',
    answer: 'No, con el objetivo de ofrecer la mejor calidad y atención a nuestros clientes pedimos verificar bien los productos y los detalles de envio proporcionados, de esa manera se reducirán problemas con su envío.',
    order: null,
    created_at: new Date().toISOString(),
  },
  // FIX: Added missing `order` and `created_at` properties.
  {
    id: 4,
    question: '¿Qué metodos de pago aceptan?',
    answer: 'Contamos con método de pago en efectivo contra entrega (si reside en La Unión) y pagos mediante transferencia bancaria.',
    order: null,
    created_at: new Date().toISOString(),
  },
];

export const INFO_FEATURES: InfoFeature[] = [
    { id: 1, icon: '✨', title: 'Calidad Premium', description: 'Ingredientes de la más alta calidad para resultados increíbles.' },
    { id: 2, icon: '🛡️', title: 'Seguridad en tu Pedido', description: 'Compra con confianza, tu pedido está seguro.' },
    { id: 3, icon: '🎁', title: 'Pedidos Personalizados', description: 'Traemos tus productos favoritos bajo pedido, solo para ti.' },
    { id: 4, icon: '🚚', title: 'Envío Rápido', description: 'Recibe tus productos favoritos en la puerta de tu casa.' },
];

export const CATEGORIES = ['Todos', ...new Set(PRODUCTS.map(p => p.category))];