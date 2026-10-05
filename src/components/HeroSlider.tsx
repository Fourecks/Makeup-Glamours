import React, { useState, useEffect } from "react";
import { Slide } from "../types";
import Editable from "./Editable";
import PencilIcon from "./icons/PencilIcon";
import PlayIcon from "./icons/PlayIcon";
import PauseIcon from "./icons/PauseIcon";
import BeautyIcon from "./icons/BeautyIcon";
interface HeroSliderProps {
  slides: Slide[];
  isAdmin: boolean;
  onUpdate: (
    id: number,
    fields: Partial<Omit<Slide, "id" | "created_at">>,
  ) => void;
  sliderSpeed: number;
  onOpenSliderEditor: () => void;
  fallbackImage?: string;
}
const HeroSlider: React.FC<HeroSliderProps> = ({
  slides,
  isAdmin,
  onUpdate,
  sliderSpeed,
  onOpenSliderEditor,
  fallbackImage,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const change = () => setReducedMotion(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    if (currentSlide >= slides.length) setCurrentSlide(0);
  }, [slides.length, currentSlide]);
  useEffect(() => {
    if (slides.length > 1 && !isPaused && !isHovered && !reducedMotion) {
      const timer = setTimeout(
        () => setCurrentSlide((prev) => (prev + 1) % slides.length),
        sliderSpeed,
      );
      return () => clearTimeout(timer);
    }
  }, [
    currentSlide,
    slides.length,
    sliderSpeed,
    isPaused,
    isHovered,
    reducedMotion,
  ]);
  const slide = slides[currentSlide];
  const image = slide?.image_url || fallbackImage;
  const position = slide?.content_position || "center-left";
  const alignment = position.endsWith("right")
    ? "right"
    : position.endsWith("center") || position === "center"
      ? "center"
      : "left";
  return (
    <section
      id="home"
      className="editorial-hero shop-shell"
      aria-label="Descubre Makeup Glamours"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="hero-copy"
        style={{
          textAlign: slide?.title ? alignment : "left",
          justifyContent: position.startsWith("top")
            ? "flex-start"
            : position.startsWith("bottom")
              ? "flex-end"
              : "center",
        }}
      >
        <h1>
          {slide?.title ? (
            <Editable
              as="span"
              isAdmin={isAdmin}
              value={slide.title}
              onSave={(value) => onUpdate(slide.id, { title: value })}
            />
          ) : (
            <>
              Realza tu belleza
              <br />
              <em>todos los días</em>
              <BeautyIcon kind="heart" className="hero-heart" />
            </>
          )}
        </h1>
        <p className="hero-description">
          {slide?.subtitle ? (
            <Editable
              as="span"
              isAdmin={isAdmin}
              value={slide.subtitle}
              onSave={(value) => onUpdate(slide.id, { subtitle: value })}
            />
          ) : (
            "Descubre maquillaje, skincare y tus productos favoritos en un solo lugar."
          )}
        </p>
        <div className="hero-actions">
          <a
            className="primary-button"
            href={
              slide?.button_link && slide.button_link !== "#"
                ? slide.button_link
                : "/tienda"
            }
          >
            {slide?.button_text || "Explorar productos"}
            <BeautyIcon kind="arrow" className="h-4 w-4" />
          </a>
          <a className="text-link" href="/novedades">
            Ver novedades
          </a>
        </div>
        <p className="hero-note">
          <BeautyIcon kind="chat" className="h-4 w-4" />
          Elige aquí. Finaliza con nosotros por WhatsApp.
        </p>
        {isAdmin && (
          <button className="text-link hero-edit" onClick={onOpenSliderEditor}>
            <PencilIcon className="h-4 w-4" />
            Editar carrusel
          </button>
        )}
      </div>
      <div className="hero-photo">
        {image ? (
          <img
            key={image}
            src={image}
            alt={slide?.title || "Selección de belleza de Makeup Glamours"}
            width="680"
            height="680"
            loading="eager"
            decoding="async"
            style={{
              objectPosition: `${slide?.image_position_x ?? 50}% ${slide?.image_position_y ?? 50}%`,
            }}
          />
        ) : (
          <div className="image-empty">
            Aquí irá una fotografía real de Makeup Glamours.
          </div>
        )}
        {slides.length > 1 && (
          <div className="hero-slider-controls">
            <div className="slide-dots">
              {slides.map((s, index) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Ver fotografía ${index + 1}`}
                  aria-pressed={index === currentSlide}
                  className={index === currentSlide ? "active" : ""}
                />
              ))}
            </div>
            <button
              className="icon-button"
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? "Reproducir carrusel" : "Pausar carrusel"}
            >
              {isPaused ? (
                <PlayIcon className="h-4 w-4" />
              ) : (
                <PauseIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
export default HeroSlider;
