import Navbar from "./Navbar";

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-stone-950/95 shadow-lg shadow-black/10 backdrop-blur-xl">
      <Navbar />
    </header>
  );
}

export default Header;