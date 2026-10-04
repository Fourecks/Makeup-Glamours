import { useCallback, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { parseRoute } from '../lib/routes';
function locationValue(){return {pathname:window.location.pathname,search:window.location.search};}
export function useStoreRouter(){
 const [location,setLocation]=useState(locationValue);
 const navigate=useCallback((href:string,replace=false)=>{
  const url=new URL(href,window.location.origin);
  if(url.origin!==window.location.origin){window.location.assign(href);return;}
  if(url.pathname===window.location.pathname&&url.search===window.location.search&&!url.hash)return;
  window.history[replace?'replaceState':'pushState'](null,'',url.pathname+url.search+url.hash);
  setLocation(locationValue());
  if(!replace)window.scrollTo({top:0,behavior:'instant' as ScrollBehavior});
 },[]);
 useEffect(()=>{const update=()=>setLocation(locationValue());window.addEventListener('popstate',update);return()=>window.removeEventListener('popstate',update);},[]);
 // Keep links as real URLs: browser menus, new tabs and copying links work normally.
 const onLinkClick=(event:MouseEvent<HTMLElement>)=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const anchor=(event.target as Element).closest<HTMLAnchorElement>('a[href]');
  if(!anchor||anchor.target==='_blank'||anchor.hasAttribute('download'))return;
  const url=new URL(anchor.href,window.location.href);
  if(url.origin!==window.location.origin||url.hash||parseRoute(url.pathname).kind==='notFound')return;
  event.preventDefault();navigate(url.pathname+url.search);
 };
 return {location,route:parseRoute(location.pathname),navigate,onLinkClick};
}
