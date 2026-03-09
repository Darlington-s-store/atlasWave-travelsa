import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.jpeg";

interface NavChild {
  label: string;
  href: string;
}

interface NavSection {
  label: string;
  href: string;
  children?: NavChild[];
}

interface NavLinkItem {
  label: string;
  href: string;
  children?: NavChild[];
  sections?: NavSection[];
}

const navLinks: NavLinkItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  {
    label: "Services",
    href: "/travel",
    sections: [
      {
        label: "Travel Services",
        href: "/travel",
        children: [
          { label: "Flight Booking", href: "/travel/flights" },
          { label: "Hotel & Accommodation", href: "/travel/hotels" },
          { label: "Visa Assistance", href: "/travel/visa" },
        ],
      },
      {
        label: "Work Permits",
        href: "/work-permits",
        children: [
          { label: "Schengen Work Permits", href: "/work-permits/schengen" },
          { label: "Canada LMIA", href: "/work-permits/canada-lmia" },
          { label: "Germany Opportunity Card", href: "/work-permits/germany-chancenkarte" },
          { label: "USA NCLEX Pathway", href: "/work-permits/usa-nclex" },
          { label: "Credential Evaluation", href: "/work-permits/credential-evaluation" },
        ],
      },
      {
        label: "Logistics",
        href: "/logistics",
        children: [
          { label: "Logistics Overview", href: "/logistics" },
          { label: "Shipment Tracking", href: "/logistics/tracking" },
        ],
      },
    ],
  },
  { label: "Gallery", href: "/videos" },
  { label: "Documentation", href: "/documentation" },
  { label: "Contact", href: "/contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopServicesOpen, setDesktopServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-primary-foreground/10 bg-primary/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-3 md:h-20">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <img src={logo} alt="AtlasWave" className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10" />
          <span className="truncate font-display text-lg font-bold tracking-tight text-primary-foreground sm:text-xl">
            Atlas<span className="text-gradient-accent">Wave</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <div
              key={link.label}
              className="relative"
              onMouseLeave={() => {
                if (link.sections) {
                  setDesktopServicesOpen(false);
                }
              }}
            >
              {link.sections ? (
                <button
                  type="button"
                  onClick={() => setDesktopServicesOpen((open) => !open)}
                  onMouseEnter={() => setDesktopServicesOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/80 transition-colors hover:text-accent"
                >
                  {link.label}
                  <ChevronDown className={`h-4 w-4 transition-transform ${desktopServicesOpen ? "rotate-180" : ""}`} />
                </button>
              ) : (
                <Link
                  to={link.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/80 transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              )}

              {(link.children || link.sections) && (!link.sections || desktopServicesOpen) && (
                <div className="absolute left-0 top-full pt-2">
                  <div className="min-w-[280px] rounded-lg border bg-card p-3 shadow-card-hover">
                    {link.sections ? (
                      <div className="space-y-3">
                        {link.sections.map((section) => (
                          <div key={section.label}>
                            <Link
                              to={section.href}
                              className="block px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-accent"
                            >
                              {section.label}
                            </Link>
                            <div className="space-y-0.5">
                              {section.children?.map((child) => (
                                <Link
                                  key={child.label}
                                  to={child.href}
                                  onClick={() => setDesktopServicesOpen(false)}
                                  className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      link.children?.map((child) => (
                        <Link
                          key={child.label}
                          to={child.href}
                          onClick={() => setDesktopServicesOpen(false)}
                          className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                        >
                          {child.label}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="hero-outline" size="sm" asChild>
            <Link to="/tracking">Track Shipment</Link>
          </Button>
          {isAuthenticated ? (
            <Button variant="accent" size="sm" asChild>
              <Link to="/profile">My Profile</Link>
            </Button>
          ) : (
            <Button variant="accent" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="shrink-0 p-2 text-primary-foreground lg:hidden">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-primary-foreground/10 bg-primary lg:hidden"
          >
            <div className="container max-h-[calc(100svh-4rem)] space-y-1 overflow-y-auto py-4">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.sections ? (
                    <button
                      type="button"
                      onClick={() => setMobileServicesOpen((open) => !open)}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium text-primary-foreground/80 transition-colors hover:text-accent"
                    >
                      <span>{link.label}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`} />
                    </button>
                  ) : (
                    <Link
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2.5 text-sm font-medium text-primary-foreground/80 transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  )}

                  {link.sections && mobileServicesOpen
                    ? link.sections.map((section) => (
                        <div key={section.label} className="pb-1 pl-5">
                          <Link
                            to={section.href}
                            onClick={() => {
                              setMobileOpen(false);
                              setMobileServicesOpen(false);
                            }}
                            className="block py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/45 transition-colors hover:text-accent"
                          >
                            {section.label}
                          </Link>
                          {section.children?.map((child) => (
                            <Link
                              key={child.label}
                              to={child.href}
                              onClick={() => {
                                setMobileOpen(false);
                                setMobileServicesOpen(false);
                              }}
                              className="block py-2 pl-4 text-sm text-primary-foreground/65 transition-colors hover:text-accent"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      ))
                    : !link.sections
                      ? link.children?.map((child) => (
                          <Link
                            key={child.label}
                            to={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="block py-2 pl-8 text-sm text-primary-foreground/60 transition-colors hover:text-accent"
                          >
                            {child.label}
                          </Link>
                        ))
                      : null}
                </div>
              ))}

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <Button variant="hero-outline" size="sm" className="w-full sm:flex-1" asChild>
                  <Link to="/tracking" onClick={() => setMobileOpen(false)}>
                    Track Shipment
                  </Link>
                </Button>
                {isAuthenticated ? (
                  <Button variant="accent" size="sm" className="w-full sm:flex-1" asChild>
                    <Link to="/profile" onClick={() => setMobileOpen(false)}>
                      My Profile
                    </Link>
                  </Button>
                ) : (
                  <Button variant="accent" size="sm" className="w-full sm:flex-1" asChild>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
