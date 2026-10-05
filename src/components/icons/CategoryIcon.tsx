import { slugify } from '../../lib/routes';
import lipstick from '../../assets/category-icons/lipstick.svg';
import mascara from '../../assets/category-icons/mascara.svg';
import powder from '../../assets/category-icons/face-powder.svg';
import cream from '../../assets/category-icons/hand-cream.svg';
import foundation from '../../assets/category-icons/foundation-makeup.svg';
import perfume from '../../assets/category-icons/perfumer-bottle.svg';
import comb from '../../assets/category-icons/comb.svg';
import brush from '../../assets/category-icons/cosmetic-brush.svg';
import eyebrow from '../../assets/category-icons/eyebrow.svg';
import gloss from '../../assets/category-icons/lip-gloss.svg';
import cleanser from '../../assets/category-icons/facial-cleanser.svg';
import palette from '../../assets/category-icons/makeups.svg';

/** SVG Repo makeup collection, CC0. Decorative; the category name labels the link. */
export default function CategoryIcon({ category, className = '' }: { category: string; className?: string }) {
  const name = slugify(category);
  const source = /paleta|sombra|ojos-y/.test(name) ? palette
    : /ceja/.test(name) ? eyebrow
    : /mascara|pestana/.test(name) ? mascara
    : /delineador/.test(name) ? gloss
    : /labio/.test(name) ? lipstick
    : /perfume/.test(name) ? perfume
    : /cabello/.test(name) ? comb
    : /rubor/.test(name) ? brush
    : /polvo/.test(name) ? powder
    : /base|corrector|primer/.test(name) ? foundation
    : /tinta/.test(name) ? gloss
    : /skincare/.test(name) ? cleanser : cream;
  return <img className={className} src={source} width="68" height="68" alt="" aria-hidden="true" decoding="async" />;
}
