import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { loadEnv } from 'vite';
import { loadRoutes } from './load-routes.mjs';
const {productPath,categoryPath}=await loadRoutes();
const env={...loadEnv('production',process.cwd(),'VITE_'),...process.env};
const api=env.VITE_SUPABASE_URL;
const key=env.VITE_SUPABASE_ANON_KEY;
if(!api||!key)throw new Error('Se requieren las variables existentes VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para generar páginas.');
const response=await fetch(`${api}/rest/v1/products?select=id,name,description,category,image_url,price,stock,variants:product_variants(stock)&order=created_at.desc`,{headers:{apikey:key,Authorization:`Bearer ${key}`},signal:AbortSignal.timeout(30000)});
if(!response.ok)throw new Error(`No se pudo leer el catálogo para generar páginas: HTTP ${response.status}`);
const products=await response.json();
if(!Array.isArray(products)||!products.length)throw new Error('El catálogo está vacío; se detiene la publicación para proteger las páginas existentes.');
const categories=[...new Set(products.map(p=>p.category))];
if(new Set(categories.map(categoryPath)).size!==categories.length)throw new Error('Hay categorías con la misma URL. Resolver antes de publicar.');
const origin=(env.VITE_SITE_URL||'https://makeup-glamours.onrender.com').replace(/\/$/,'');
const template=await readFile('dist/index.html','utf8');
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const links=products.map(p=>`<li><a href="${escape(productPath(p))}">${escape(p.name)}</a> — $${Number(p.price).toFixed(2)}</li>`).join('');
const urls=[];
async function page(path,title,description,body,image='',schema=null){
 const url=origin+(path==='/'?'/':path+'/');
 let html=template.replace(/<title>[^<]*<\/title>/,`<title>${escape(title)}</title>`)
 .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/?\s*>)/,`$1${escape(description)}$2`)
 .replace(/(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/?\s*>)/,`$1${escape(title)}$2`)
 .replace(/(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/?\s*>)/,`$1${escape(description)}$2`);
 if(image)html=html.replace(/(<meta\s+property="og:image"\s+content=")[^"]*("\s*\/?\s*>)/,`$1${escape(image)}$2`);
 html=html.replace('</head>',`<link rel="canonical" href="${escape(url)}"><meta property="og:url" content="${escape(url)}">${schema?`<script id="product-schema" type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>`:''}</head>`)
 .replace(/<div id="root"><\/div>/,`<div id="root"><main style="max-width:1100px;margin:40px auto;padding:24px;font-family:sans-serif;color:#2a2020"><nav><a href="/">Makeup Glamours</a> · <a href="/tienda">Tienda</a> · <a href="/categorias">Categorías</a></nav>${body}</main></div>`);
 const directory=path==='/'?'dist':`dist${path}`;
 await mkdir(directory,{recursive:true});await writeFile(`${directory}/index.html`,html);urls.push(url);
}
await page('/','Makeup Glamours | Maquillaje y belleza en El Salvador','Maquillaje y cuidado personal. Elige tus favoritos y coordina tu pedido por WhatsApp.','<h1>Makeup Glamours</h1><p>Tu belleza, a tu manera.</p><a href="/tienda">Explorar productos</a>');
await page('/tienda','Tienda | Makeup Glamours','Explora maquillaje y cuidado personal en Makeup Glamours. Agrega al carrito y finaliza por WhatsApp.',`<h1>Nuestra tienda</h1><ul>${links}</ul>`);
await page('/novedades','Novedades | Makeup Glamours','Los últimos productos añadidos al catálogo de Makeup Glamours.',`<h1>Recién llegados</h1><ul>${links}</ul>`);
await page('/categorias','Categorías | Makeup Glamours','Encuentra tus favoritos por categoría.',`<h1>Categorías</h1><ul>${categories.map(c=>`<li><a href="${categoryPath(c)}">${escape(c)}</a></li>`).join('')}</ul>`);
for(const category of categories){const group=products.filter(p=>p.category===category);await page(categoryPath(category),`${category} | Makeup Glamours`,`Descubre ${category.toLowerCase()} en Makeup Glamours. Elige tus favoritos y coordina tu pedido por WhatsApp.`,`<h1>${escape(category)}</h1><ul>${group.map(p=>`<li><a href="${productPath(p)}">${escape(p.name)}</a> — $${Number(p.price).toFixed(2)}</li>`).join('')}</ul>`);}
for(const product of products){
 const image=product.image_url?.split(',')[0]?.trim()||'';
 const totalStock=product.variants?.length?product.variants.reduce((sum,v)=>sum+v.stock,0):product.stock;
 const schema={'@context':'https://schema.org','@type':'Product',name:product.name,description:product.description,...(image?{image:[image]}:{}),sku:product.id,offers:{'@type':'Offer',url:origin+productPath(product)+'/',priceCurrency:'USD',price:Number(product.price).toFixed(2),availability:totalStock>0?'https://schema.org/InStock':'https://schema.org/OutOfStock'}};
 await page(productPath(product),`${product.name} | Makeup Glamours`,product.description,`<h1>${escape(product.name)}</h1>${image?`<img src="${escape(image)}" alt="${escape(product.name)}" width="360" style="max-width:100%;height:auto">`:''}<p>${escape(product.description)}</p><p>$${Number(product.price).toFixed(2)}</p><p><a href="${categoryPath(product.category)}">${escape(product.category)}</a></p><p>Elige tus variantes, agrega al carrito y finaliza el pedido por WhatsApp.</p>`,image,schema);
}
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url=>`<url><loc>${escape(url)}</loc></url>`).join('')}</urlset>`);
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile('dist/404.html',template.replace('</head>','<meta name="robots" content="noindex"></head>'));
console.log(`Páginas estáticas listas: ${products.length} productos, ${categories.length} categorías, tienda, novedades e inicio.`);
