import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "../../data/mockData";
import { Button } from "../../components/ui";

interface HeroBannerProps {
  banners?: Banner[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export const HeroBanner = ({
  banners = [],
  autoPlay = true,
  autoPlayInterval = 5000,
}: HeroBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(() => (index + banners.length) % banners.length);
  }, [banners.length]);

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  useEffect(() => {
    if (!autoPlay || banners.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, banners.length, isHovered, autoPlayInterval, nextSlide]);

  if (banners.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden"
      aria-label="Hero banner carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative h-[400px] sm:h-[500px] lg:h-[600px]"
        role="region"
        aria-roledescription="carousel"
        aria-label="Hero promotional banners"
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${banners.length}`}
            aria-current={index === currentIndex ? "true" : "false"}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${banner.image})` }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl animate-fade-in">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-inverse mb-4 leading-tight">
                    {banner.title}
                  </h1>
                  <p className="text-lg sm:text-xl text-text-inverse/90 mb-6 leading-relaxed">
                    {banner.subtitle}
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => window.location.href = banner.ctaLink}
                  >
                    {banner.ctaText}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface/80 text-text-primary hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors hidden sm:block"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface/80 text-text-primary hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors hidden sm:block"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {banners.length > 1 && (
        <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Banner navigation">
          {banners.map((_, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => goToSlide(index)}
              className={`
                w-2.5 h-2.5 rounded-full transition-all duration-300
                ${index === currentIndex
                  ? "bg-primary w-8"
                  : "bg-text-muted/50 hover:bg-text-muted"
                }
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
              `}
            />
          ))}
        </div>
      )}
    </section>
  );
};