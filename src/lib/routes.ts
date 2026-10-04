import type { Product } from '../types';
export type StoreRoute =
 | { kind: 'home' | 'shop' | 'categories' | 'new' | 'notFound' }
 | { kind: 'category'; slug: string }
 | { kind: 'product'; id: string };
export function slugify(value: string): string {
 return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
export function categoryPath(category: string): string {return `/categorias/${slugify(category)}`;}
export function productPath(product: Pick<Product,'name'|'id'>): string {return `/producto/${slugify(product.name)}--${encodeURIComponent(product.id)}`;}
export function parseRoute(pathname: string): StoreRoute {
 const path=pathname.replace(/\/+$/,'')||'/';
 if(path==='/')return {kind:'home'};
 if(path==='/tienda')return {kind:'shop'};
 if(path==='/categorias')return {kind:'categories'};
 if(path==='/novedades')return {kind:'new'};
 if(/^\/categorias\/[^/]+$/.test(path)) {try{return {kind:'category',slug:decodeURIComponent(path.split('/')[2])};}catch{return {kind:'notFound'};}}
 if(/^\/producto\/[^/]+$/.test(path)) {
  const segment=path.split('/')[2]; const id=segment.includes('--')?segment.slice(segment.lastIndexOf('--')+2):segment;
  try{return {kind:'product',id:decodeURIComponent(id)};}catch{return {kind:'notFound'};}
 }
 return {kind:'notFound'};
}
