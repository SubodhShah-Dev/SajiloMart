import { NavLink } from "react-router-dom";
import type { Banner } from "../../data/mockData";

interface PromoBannersProps {
  banners?: Banner[];
}

export const PromoBanners = ({ banners = [] }: PromoBannersProps) => {
  if (banners.length === 0) return null;

  return (
    <section className="py-12 sm:py-16" aria-labelledby="promo-banners-heading">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          role="list"
          aria-label="Promotional banner cards"
        >
          {banners.map((banner) => (
            <article key={banner.id} role="listitem">
              <NavLink
                to={banner.ctaLink}
                className="relative block aspect-[2/1] overflow-hidden rounded-xl group"
              >
                <img
                  src={banner.image}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h3 className="text-xl sm:text-2xl font-bold text-text-inverse mb-2">
                    {banner.title}
                  </h3>
                  <p className="text-text-inverse/90 mb-4">
                    {banner.subtitle}
                  </p>
                  <span className="inline-flex items-center gap-2 w-fit px-4 py-2 bg-text-inverse text-primary font-medium rounded-lg hover:bg-text-inverse/90 transition-colors">
                    {banner.ctaText}
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                </div>
              </NavLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};