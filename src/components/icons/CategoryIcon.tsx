import { slugify } from '../../lib/routes';

/** Decorative line icons; the adjacent category name provides the accessible label. */
export default function CategoryIcon({ category, className = '' }: { category: string; className?: string }) {
  const name = slugify(category);
  let drawing;
  if (/paleta|sombra/.test(name)) drawing = <><rect x="4" y="5" width="24" height="22" rx="2"/><path d="M4 16h24"/><circle cx="10" cy="10.5" r="2"/><circle cx="22" cy="10.5" r="2"/><circle cx="10" cy="21.5" r="2"/><circle cx="22" cy="21.5" r="2"/></>;
  else if (/mascara|pestana/.test(name) && !/ceja/.test(name)) drawing = <><rect x="6" y="17" width="7" height="12" rx="1"/><path d="M9.5 17V8m10 17V5m-3 1h6m-6 3h6m-6 3h6m-6 3h6"/></>;
  else if (/delineador|ceja/.test(name)) drawing = <><path d="m7 25 13-17 5 4-13 17-6 1 1-5Zm13-17 2-3 5 4-2 3M7 25l5 4M18 11l5 4"/><path d="M4 9c3-4 7-5 11-4"/></>;
  else if (/labio/.test(name) && !/ojos/.test(name)) drawing = <><path d="M10 16V8l8-4v12M8 16h12v13H8zM10 21h8"/></>;
  else if (/perfume/.test(name)) drawing = <><rect x="6" y="12" width="20" height="17" rx="3"/><path d="M12 12V8h8v4M12 4h8v4M11 18h10v6H11zM24 5h3m-2 3 3 1"/></>;
  else if (/cabello/.test(name)) drawing = <><path d="M9 29V5a2 2 0 0 1 2-2h3v26M14 5h10m-10 4h10m-10 4h10m-10 4h10m-10 4h10"/></>;
  else if (/polvo|rubor/.test(name)) drawing = <><ellipse cx="16" cy="12" rx="11" ry="8"/><ellipse cx="16" cy="12" rx="7" ry="5"/><path d="M5 12v8c0 5 5 8 11 8s11-3 11-8v-8M5 20c5 5 17 5 22 0"/></>;
  else if (/base|corrector|primer/.test(name)) drawing = <><rect x="9" y="12" width="14" height="17" rx="2"/><path d="M12 12V6h8v6M16 6V3h8v3h-8M13 19h6m-6 4h6"/></>;
  else if (/crema|skincare|tinta/.test(name)) drawing = <><path d="M8 4h16l-3 20H11L8 4Zm3 20h10v5H11zM9 8h14M14 14h4m-4 4h4"/></>;
  else drawing = <><path d="M9 29V16h7v13H9Zm1-13V8l5-3v11M23 7v5m-2.5-2.5h5M24 20v6m-3-3h6M4 5v4M2 7h4"/></>;
  return <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{drawing}</svg>;
}
