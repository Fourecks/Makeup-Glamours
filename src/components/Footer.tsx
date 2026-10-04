import React from "react";
import BeautyIcon from "./icons/BeautyIcon";
interface FooterProps {
  siteName: string;
  logo: string;
  phoneNumber: string;
  instagramUrl: string;
  onAdminClick: () => void;
}
const Footer: React.FC<FooterProps> = ({
  siteName,
  logo,
  phoneNumber,
  instagramUrl,
  onAdminClick,
}) => (
  <footer className="shop-footer">
    <div className="shop-shell">
      <div className="footer-main">
        <div>
          <div className="brand">
            <img src={logo} alt="" width="40" height="40" />
            <span>{siteName}</span>
          </div>
          <nav className="footer-shop-links" aria-label="Explorar tienda"><a href="/tienda">Tienda</a><a href="/categorias">Categorías</a><a href="/novedades">Novedades</a></nav>
          <p>
            Un pequeño detalle. Mucha belleza.
            <br />
            Tus favoritos, en un solo lugar.
          </p>
        </div>
        <div>
          <h3>Hablemos de belleza</h3>
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
            Síguenos en Instagram{" "}
            <BeautyIcon kind="arrow" className="h-4 w-4" />
          </a>
          <a
            href={`https://wa.me/${phoneNumber}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Escríbenos por WhatsApp{" "}
            <BeautyIcon kind="arrow" className="h-4 w-4" />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} {siteName}. Todos los derechos
          reservados.
        </p>
        <button onClick={onAdminClick}>Administración</button>
      </div>
    </div>
  </footer>
);
export default Footer;
