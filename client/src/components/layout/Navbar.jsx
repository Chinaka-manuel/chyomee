import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import BrandLogo from "../ui/BrandLogo";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const menuButtonRef = useRef(null);
  const { cartItems } = useCart();
  const { favoritesCount } = useFavorites();
  const navigate = useNavigate();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const closeMenu = () => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/shop?search=${encodeURIComponent(query)}` : "/shop");
    setSearch("");
    closeMenu();
  };

  return (
    <nav className="border-b border-white/20 bg-white/70 backdrop-blur-xl" aria-label="Main navigation">
      <div className="bg-stone-900 px-4 py-2 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-white sm:text-xs">
        A new season starts here <span className="mx-2 text-white/40">·</span>
        <Link to="/shop" className="underline underline-offset-2 hover:text-stone-300">
          Explore the collection
        </Link>
      </div>

      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-8 lg:h-[76px] lg:px-10">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center text-stone-800 lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="store-mobile-navigation"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link
          to="/"
          onClick={closeMenu}
          className="shrink-0 px-2 py-1"
          aria-label="chyomee home"
        >
          <BrandLogo className="h-10 w-32 sm:h-12 sm:w-40" />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          <Link to="/shop" className="text-sm font-medium hover:text-stone-500">Shop</Link>
          <Link to="/categories" className="text-sm font-medium hover:text-stone-500">Categories</Link>
          <Link to="/blog" className="text-sm font-medium hover:text-stone-500">Journal</Link>
          <div className="group relative">
            <button type="button" className="inline-flex items-center gap-1 py-6 text-sm font-medium hover:text-stone-500">
              Discover <ChevronDown size={14} />
            </button>
            <div className="invisible absolute left-0 top-full z-[100] w-52 translate-y-1 border border-stone-200 bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <Link to="/about" className="block px-3 py-2.5 text-sm hover:bg-stone-100">Our story</Link>
              <Link to="/faq" className="block px-3 py-2.5 text-sm hover:bg-stone-100">FAQs</Link>
              <Link to="/contact" className="block px-3 py-2.5 text-sm hover:bg-stone-100">Contact</Link>
              <Link to="/training" className="block px-3 py-2.5 text-sm hover:bg-stone-100">Style guides</Link>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3 lg:ml-0 lg:gap-4">
          <form onSubmit={handleSearch} className="hidden h-10 items-center border-b border-stone-300 lg:flex">
            <label htmlFor="store-search" className="sr-only">Search the shop</label>
            <input
              id="store-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
              className="w-28 bg-transparent text-sm outline-none placeholder:text-stone-400 xl:w-36"
            />
            <button type="submit" className="flex h-9 w-8 items-center justify-center text-stone-700 hover:text-stone-400" aria-label="Search">
              <Search size={18} />
            </button>
          </form>

          <Link
            to="/favorites"
            className="relative flex h-10 w-9 items-center justify-center text-stone-800 transition hover:text-rose-700"
            aria-label={`Favorites${favoritesCount ? `, ${favoritesCount} saved` : ""}`}
            title="Favorites"
          >
            <Heart size={20} />
            {favoritesCount > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-stone-900 px-1 text-[9px] font-semibold text-white">{favoritesCount}</span>}
          </Link>

          <Link
            to="/account"
            className="hidden h-10 w-9 items-center justify-center text-stone-800 transition hover:text-stone-500 sm:flex"
            aria-label="My account"
            title="My account"
          >
            <UserRound size={20} />
          </Link>

          <Link
            to="/cart"
            className="relative flex h-10 w-9 items-center justify-center text-stone-800 transition hover:text-stone-500"
            aria-label={`Shopping bag${cartCount ? `, ${cartCount} items` : ""}`}
            title="Shopping bag"
          >
            <ShoppingBag size={21} />
            {cartCount > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-stone-900 px-1 text-[9px] font-semibold text-white">{cartCount}</span>}
          </Link>
        </div>
      </div>

      <div
        id="store-mobile-navigation"
        className={`absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-101px)] overflow-y-auto bg-white px-5 py-5 shadow-xl transition-transform duration-300 lg:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <form onSubmit={handleSearch} className="mb-5 flex h-11 items-center gap-3 border-b border-stone-300">
          <Search size={18} className="text-stone-500" />
          <label htmlFor="mobile-store-search" className="sr-only">Search the shop</label>
          <input
            id="mobile-store-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search the collection"
            className="h-full w-full bg-transparent text-sm outline-none"
          />
          <button type="submit" className="text-sm font-semibold">Search</button>
        </form>
        <div className="flex flex-col divide-y divide-stone-200">
          <Link to="/shop" onClick={closeMenu} className="py-4 text-base font-medium">Shop all</Link>
          <Link to="/categories" onClick={closeMenu} className="py-4 text-base font-medium">Categories</Link>
          <Link to="/blog" onClick={closeMenu} className="py-4 text-base font-medium">Journal</Link>
          <Link to="/about" onClick={closeMenu} className="py-4 text-base font-medium">Our story</Link>
          <Link to="/faq" onClick={closeMenu} className="py-4 text-base font-medium">FAQs</Link>
          <Link to="/contact" onClick={closeMenu} className="py-4 text-base font-medium">Contact</Link>
          <Link to="/training" onClick={closeMenu} className="py-4 text-base font-medium">Style guides</Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link to="/account" onClick={closeMenu} className="flex min-h-11 items-center justify-center gap-2 border border-stone-300 text-sm font-medium"><UserRound size={16} /> Account</Link>
          <Link to="/favorites" onClick={closeMenu} className="flex min-h-11 items-center justify-center gap-2 border border-stone-300 text-sm font-medium"><Heart size={16} /> Saved ({favoritesCount})</Link>
        </div>
      </div>
      {menuOpen && <button type="button" aria-label="Close menu" className="absolute inset-x-0 top-full z-30 h-[calc(100dvh-101px)] bg-black/30 lg:hidden" onClick={closeMenu} />}
    </nav>
  );
}

export default Navbar;
