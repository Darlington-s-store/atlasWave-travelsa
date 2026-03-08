import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.jpeg";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
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
  { label: "Logistics", href: "/logistics" },
  { label: "Documentation", href: "/documentation" },
  { label: "Contact", href: "/contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-primary-foreground/10">
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="AtlasWave" className="w-10 h-10 rounded-full object-cover" />
          <span className="font-display text-xl font-bold text-primary-foreground tracking-tight">
            Atlas<span className="text-gradient-accent">Wave</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <div key={link.label} className="relative group">
              <Link
                to={link.href}
                className="px-3 py-2 text-sm font-medium text-primary-foreground/80 hover:text-accent transition-colors rounded-md"
              >
                {link.label}
              </Link>
              {link.children && (
                <div className="absolute top-full left-0 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                  <div className="bg-card rounded-lg shadow-card-hover border p-2 min-w-[220px]">
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.href}
                        className="block px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
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

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden text-primary-foreground p-2"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-primary border-t border-primary-foreground/10 overflow-hidden"
          >
            <div className="container py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-primary-foreground/80 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                  {link.children?.map((child) => (
                    <Link
                      key={child.label}
                      to={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block pl-8 py-2 text-sm text-primary-foreground/60 hover:text-accent transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <Button variant="hero-outline" size="sm" className="flex-1" asChild>
                  <Link to="/tracking" onClick={() => setMobileOpen(false)}>Track Shipment</Link>
                </Button>
                {isAuthenticated ? (
                  <Button variant="accent" size="sm" className="flex-1" asChild>
                    <Link to="/profile" onClick={() => setMobileOpen(false)}>My Profile</Link>
                  </Button>
                ) : (
                  <Button variant="accent" size="sm" className="flex-1" asChild>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>Sign In</Link>
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
