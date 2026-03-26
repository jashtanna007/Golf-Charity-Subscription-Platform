import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-outline-variant/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-headline text-title-sm">G</span>
              </div>
              <span className="font-headline text-title-md text-on-surface">
                The Philanthropic Green
              </span>
            </Link>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Precision engineering for the modern golfer with a focus on global impact and performance.
            </p>
          </div>

          <div>
            <h4 className="font-label text-label-lg uppercase text-on-surface mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/dashboard" className="text-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/charities" className="text-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Charity Partners
                </Link>
              </li>
              <li>
                <Link to="/subscription" className="text-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Prize Draw Rules
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-label text-label-lg uppercase text-on-surface mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-body-md text-on-surface-variant hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/" className="text-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/" className="text-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-label text-label-lg uppercase text-on-surface mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/" className="text-body-md text-on-surface-variant hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Member Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-body-sm text-on-surface-variant">
            © {currentYear} The Philanthropic Green. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-body-sm text-on-surface-variant">
            Made with <Heart className="w-3.5 h-3.5 text-error fill-error" /> for global impact
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
