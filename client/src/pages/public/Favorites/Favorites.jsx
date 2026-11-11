import { Link } from "react-router-dom";
import { Heart, Search } from "lucide-react";
import { useFavorites } from "../../../context/FavoritesContext";
import AccountNavigation from "../../account/AccountNavigation";

function formatPrice(price) {
  return `₦${Number(price).toLocaleString("en-NG")}`;
}

function Favorites() {
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-green-950 py-14 text-white">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          <h1 className="text-4xl font-bold">Favorites</h1>
          <p className="mt-2 text-sm text-green-100/80">
            Products you saved for later
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          <AccountNavigation />

          {favorites.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-700">
                <Search size={24} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-green-950">
                No favorites yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                You haven't saved any products. Browse the store and tap the
                heart to save items.
              </p>
              <Link
                to="/shop"
                className="mt-5 inline-block font-semibold text-green-700 hover:underline"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {favorites.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-lg border border-slate-200 bg-white transition duration-200"
                >
                  <div className="relative h-52 overflow-hidden rounded-t-lg bg-gray-50 sm:h-56 sm:aspect-square sm:rounded-t-lg">
                    <Link
                      to={`/product/${product.id}`}
                      className="block h-full w-full"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="block h-full w-full object-contain object-center p-1.5 transition duration-300 group-hover:scale-105 sm:p-3"
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(product)}
                      className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-red-500"
                      aria-label={`Remove ${product.name} from favorites`}
                    >
                      <Heart size={17} fill={"currentColor"} />
                    </button>
                  </div>

                  <div className="p-5">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-green-700">
                      {product.category}
                    </span>
                    <Link to={`/product/${product.id}`} className="mt-2 block">
                      <h3 className="mt-2 text-base font-bold leading-6 text-green-950">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="mt-3 text-sm text-slate-500">
                      {product.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <strong className="text-lg font-bold text-green-950">
                        {formatPrice(product.price)}
                      </strong>
                      <Link
                        to={`/product/${product.id}`}
                        className="rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Favorites;
