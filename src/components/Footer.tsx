import { Link } from "react-router-dom";
import { Plane, Ship, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Plane className="w-5 h-5 text-accent" />
              <Ship className="w-5 h-5 text-accent" />
              <span className="font-display text-xl font-bold">
                Globe<span className="text-gradient-accent">Link</span>
              </span>
            </div>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              Your trusted partner for travel, work permits, immigration services, and global logistics solutions.
            </p>
          </div>

          {/* Travel */}
          <div>
            <h4 className="font-display text-base font-semibold mb-4">Travel & Tours</h4>
            <ul className="space-y-2">
              {["Flight Booking", "Hotel & Accommodation", "Visa Assistance", "Travel Packages"].map((item) => (
                <li key={item}>
                  <Link to="/travel" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Work Permits */}
          <div>
            <h4 className="font-display text-base font-semibold mb-4">Work Permits</h4>
            <ul className="space-y-2">
              {["Schengen Permits", "Canada LMIA", "Germany Chancenkarte", "USA NCLEX", "Credential Evaluation"].map((item) => (
                <li key={item}>
                  <Link to="/work-permits" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-base font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-primary-foreground/60">
                <MapPin className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                123 Global Avenue, Accra, Ghana
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                +233 123 456 789
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                info@globelink.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center">
          <p className="text-sm text-primary-foreground/40">
            © {new Date().getFullYear()} GlobeLink Travel & Logistics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
