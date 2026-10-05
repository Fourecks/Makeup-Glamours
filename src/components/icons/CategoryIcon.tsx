import { slugify } from '../../lib/routes';

/** Original, scalable beauty pictograms on a shared 48px optical grid. */
export default function CategoryIcon({ category, className = '' }: { category: string; className?: string }) {
  const name = slugify(category);
  let drawing;
  if (/paleta|sombra/.test(name)) drawing = <><rect x="7" y="9" width="34" height="30" rx="4"/><path d="M7 24h34"/><circle cx="17" cy="16.5" r="3.5"/><circle cx="31" cy="16.5" r="3.5"/><circle cx="17" cy="31.5" r="3.5"/><circle cx="31" cy="31.5" r="3.5"/></>;
  else if (/mascara|pestana/.test(name) && !/ceja/.test(name)) drawing = <><rect x="9" y="25" width="10" height="16" rx="2"/><path d="M14 25V11M31 39V22"/><rect x="28" y="7" width="6" height="15" rx="3"/><path d="M25 10h12m-12 4h12m-12 4h12"/></>;
  else if (/ceja/.test(name)) drawing = <><path d="M7 17c9-8 20-8 32-1M10 22c8-5 16-5 25-1M17 35l16-9 4 6-16 9-7 1 3-7ZM17 35l4 6m9-13 4 6"/></>;
  else if (/delineador/.test(name)) drawing = <><path d="m10 32 19-22 7 6-19 22-9 3 2-9ZM10 32l7 6m9-24 7 6m-4-10 4-5 7 6-4 5"/></>;
  else if (/labio/.test(name) && !/ojos/.test(name)) drawing = <><rect x="13" y="23" width="18" height="18" rx="2"/><path d="M16 23V12c0-1 .5-2 1.5-2.5L27 5v18M16 16l11-5M13 29h18"/></>;
  else if (/perfume/.test(name)) drawing = <><rect x="10" y="19" width="28" height="22" rx="4"/><path d="M18 19v-7h12v7M17 6h14v6H17z"/><rect x="17" y="26" width="14" height="8" rx="1"/></>;
  else if (/cabello/.test(name)) drawing = <><rect x="9" y="7" width="7" height="34" rx="3.5"/><path d="M16 10h20m-20 5h20m-20 5h20m-20 5h20m-20 5h20m-20 5h20"/></>;
  else if (/rubor/.test(name)) drawing = <><circle cx="15" cy="28" r="10"/><circle cx="15" cy="28" r="6.5"/><path d="M33 26v14a3 3 0 0 0 6 0V26M32 22h8v4h-8zM32 22c-4-6-3-12 4-16 7 4 8 10 4 16M36 8v9"/></>;
  else if (/polvo/.test(name)) drawing = <><ellipse cx="24" cy="18" rx="16" ry="12"/><ellipse cx="24" cy="18" rx="11" ry="8"/><path d="M8 18v11c0 7 7 12 16 12s16-5 16-12V18M8 29c7 7 25 7 32 0"/></>;
  else if (/corrector/.test(name)) drawing = <><rect x="9" y="22" width="12" height="19" rx="2"/><path d="M15 22V11M31 40V18m0 0 4-10-5-2-4 10 5 2Z"/></>;
  else if (/base|primer/.test(name)) drawing = <><rect x="13" y="19" width="22" height="22" rx="3"/><path d="M19 19V10h10v9M24 10V6h13v4H24M19 28h10m-10 5h10"/></>;
  else if (/tinta/.test(name)) drawing = <><rect x="14" y="21" width="20" height="20" rx="4"/><path d="M18 21V8h12v13M18 15h12M24 27c-5 6-5 8 0 8s5-2 0-8Z"/></>;
  else if (/crema|skincare/.test(name)) drawing = <><path d="M12 7h24l-4 27H16L12 7ZM13 13h22M19 22h10m-9 5h8"/><rect x="16" y="34" width="16" height="7" rx="1"/></>;
  else drawing = <><rect x="8" y="24" width="12" height="17" rx="2"/><path d="M10 24V14l8-5v15M32 40V22"/><path d="M28 22c-4-6-2-12 4-16 6 4 8 10 4 16h-8Z"/></>;
  return <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{drawing}</svg>;
}
