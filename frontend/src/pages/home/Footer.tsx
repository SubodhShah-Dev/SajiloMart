import { NavLink } from "react-router-dom";
import { Truck, Shield, RotateCcw, Headphones, Globe } from "lucide-react";

const footerLinks = {
  company: [
    { label: "About Us", to: "/about" },
    { label: "Careers", to: "/careers" },
    { label: "Press", to: "/press" },
    { label: "Blog", to: "/blog" },
    { label: "Affiliate Program", to: "/affiliate" },
  ],
  support: [
    { label: "Contact Us", to: "/contact" },
    { label: "Help Center", to: "/help" },
    { label: "Order Tracking", to: "/tracking" },
    { label: "Returns & Refunds", to: "/returns" },
    { label: "Shipping Info", to: "/shipping" },
  ],
  legal: [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
    { label: "Cookie Policy", to: "/cookies" },
    { label: "Accessibility", to: "/accessibility" },
  ],
  services: [
    { label: "Gift Cards", to: "/gift-cards" },
    { label: "Wishlist", to: "/wishlist" },
    { label: "Price Match", to: "/price-match" },
    { label: "Bulk Orders", to: "/bulk-orders" },
  ],
};

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com" },
  { label: "Twitter", href: "https://twitter.com" },
  { label: "Instagram", href: "https://instagram.com" },
  { label: "YouTube", href: "https://youtube.com" },
];

const features = [
  { icon: Truck, title: "Free Shipping", description: "On orders over $50" },
  { icon: Shield, title: "Secure Payment", description: "100% secure checkout" },
  { icon: RotateCcw, title: "Easy Returns", description: "30-day return policy" },
  { icon: Headphones, title: "24/7 Support", description: "Dedicated customer care" },
];

export const Footer = () => {
  return (
    <footer className="bg-surface border-t border-border" role="contentinfo">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          <div className="lg:col-span-2">
            <NavLink to="/" className="flex items-center gap-2 mb-4" aria-label="SajiloMart Home">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-text-inverse">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </span>
              <span className="font-bold text-xl tracking-tight text-text-primary">SajiloMart</span>
            </NavLink>
            <p className="text-text-secondary mb-6 max-w-sm">
              Your trusted online marketplace for quality products at unbeatable prices.
              Shop with confidence and enjoy fast, reliable delivery.
            </p>
            <div className="flex gap-4" role="list" aria-label="Social media links">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary-light transition-colors"
                  aria-label={social.label}
                  role="listitem"
                >
                  <Globe className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-labelledby="company-heading">
            <h3 id="company-heading" className="font-semibold text-text-primary mb-4">Company</h3>
            <ul className="space-y-3" role="list">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <NavLink
                    to={link.to}
                    className="text-text-secondary hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="support-heading">
            <h3 id="support-heading" className="font-semibold text-text-primary mb-4">Support</h3>
            <ul className="space-y-3" role="list">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <NavLink
                    to={link.to}
                    className="text-text-secondary hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="legal-heading">
            <h3 id="legal-heading" className="font-semibold text-text-primary mb-4">Legal</h3>
            <ul className="space-y-3" role="list">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <NavLink
                    to={link.to}
                    className="text-text-secondary hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="services-heading">
            <h3 id="services-heading" className="font-semibold text-text-primary mb-4">Services</h3>
            <ul className="space-y-3" role="list">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <NavLink
                    to={link.to}
                    className="text-text-secondary hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 p-6 bg-primary-light rounded-xl" role="list" aria-label="Service features">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-3" role="listitem">
              <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h4 className="font-medium text-text-primary">{feature.title}</h4>
                <p className="text-sm text-text-secondary">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-text-muted">
              &copy; {new Date().getFullYear()} SajiloMart. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 text-sm text-text-muted">
              <NavLink to="/privacy" className="hover:text-primary transition-colors">Privacy</NavLink>
              <span aria-hidden="true">·</span>
              <NavLink to="/terms" className="hover:text-primary transition-colors">Terms</NavLink>
              <span aria-hidden="true">·</span>
              <NavLink to="/cookies" className="hover:text-primary transition-colors">Cookies</NavLink>
              <span aria-hidden="true">·</span>
              <NavLink to="/accessibility" className="hover:text-primary transition-colors">Accessibility</NavLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};