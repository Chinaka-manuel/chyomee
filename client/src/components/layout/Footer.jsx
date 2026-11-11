import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import BrandLogo from "../ui/BrandLogo";

const linkStyle = "text-sm text-stone-600 transition hover:text-stone-950";

function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-[#faf9f7]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <Link to="/" aria-label="chyomee home" className="inline-flex rounded-sm bg-stone-950 px-2 py-1">
            <BrandLogo className="h-7 w-auto" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-stone-600">
            Discover pieces that feel like you. A considered collection for everyday style.
          </p>
          <Link to="/contact" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-stone-900 underline underline-offset-4">
            Get in touch <ArrowUpRight size={15} />
          </Link>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-900">Shop</h2>
          <ul className="mt-4 space-y-3">
            <li><Link to="/shop" className={linkStyle}>Shop all</Link></li>
            <li><Link to="/categories" className={linkStyle}>Categories</Link></li>
            <li><Link to="/favorites" className={linkStyle}>Saved favourites</Link></li>
            <li><Link to="/cart" className={linkStyle}>Shopping bag</Link></li>
            <li><Link to="/account" className={linkStyle}>My account</Link></li>
            <li><Link to="/orders" className={linkStyle}>Order history</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-900">Discover</h2>
          <ul className="mt-4 space-y-3">
            <li><Link to="/about" className={linkStyle}>Our story</Link></li>
            <li><Link to="/blog" className={linkStyle}>Journal</Link></li>
            <li><Link to="/reviews" className={linkStyle}>Customer reviews</Link></li>
            <li><Link to="/faq" className={linkStyle}>FAQs</Link></li>
            <li><Link to="/training" className={linkStyle}>Workshops & training</Link></li>
            <li><Link to="/contact" className={linkStyle}>Contact</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-900">Here to help</h2>
          <p className="mt-4 text-sm leading-6 text-stone-600">
            Questions about your order or the collection? Our team is happy to help.
          </p>
          <Link to="/contact" className="mt-3 inline-block text-sm font-semibold text-stone-900 underline underline-offset-4">
            Visit customer care
          </Link>
          <div className="mt-6 flex flex-col gap-2 text-xs text-stone-500">
            <Link to="/privacy" className="hover:text-stone-900">Privacy policy</Link>
            <Link to="/terms" className="hover:text-stone-900">Terms & conditions</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>© {new Date().getFullYear()} chyomee. All rights reserved.</p>
          <p>Made for your everyday.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
