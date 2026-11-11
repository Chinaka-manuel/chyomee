import { Link } from "react-router-dom";
import { useCategoryContext } from "../../../context/CategoryContext";
import { fashionImages } from "../../../data/fashionImages";
import ScrollReveal from "../../../components/ui/ScrollReveal";

const Categories = () => {
  const { activeCategories } = useCategoryContext();

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <ScrollReveal as="section" className="relative flex min-h-105 items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${fashionImages[2]}")`,
          }}
        />

        <div className="absolute inset-0 bg-green-950/70" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-20 text-center sm:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl border border-white/25 bg-white/10 px-6 py-10 shadow-2xl shadow-black/20 backdrop-blur-xl sm:px-12">
            <span className="mb-4 inline-block text-sm font-bold tracking-[3px] text-yellow-400">
              chyomee
            </span>

            <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
              Shop the Collection
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
              Find fashion and accessories curated for personal style and
              everyday wear.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Categories */}
      <ScrollReveal as="section" className="px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-green-700">
              Shop by Category
            </span>

            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What Are You Looking For?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-500">
              Explore clothing, shoes, bags, and the details that complete your
              look.
            </p>
          </div>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {activeCategories.map((category, index) => (
              <ScrollReveal as="div" key={category.name} delay={index * 0.06}>
              <Link
                to={`/categories/${encodeURIComponent(category.slug)}`}
                className="group block overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-gray-50 sm:h-64">
                  <img
                    src={fashionImages[index % fashionImages.length]}
                    alt={category.name}
                    className="h-full w-full object-contain object-center p-2 transition duration-500 group-hover:scale-105 sm:object-cover sm:p-0"
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

                  <div className="absolute bottom-4 left-5">
                    <h3 className="text-2xl font-bold text-white">
                      {category.name}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="min-h-12 text-sm leading-6 text-gray-500">
                    {category.description}
                  </p>

                  <div className="mt-5 flex items-center font-bold text-green-700 transition group-hover:text-green-900">
                    Explore Category
                    <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal as="section" className="bg-green-900 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            A considered edit for every day
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/80">
            Discover versatile pieces and new-season finds from chyomee.
          </p>

          <Link
            to="/shop"
            className="mt-7 inline-flex rounded-lg bg-yellow-500 px-7 py-3.5 font-bold text-green-950 transition hover:bg-yellow-400"
          >
            Shop All Products
          </Link>
        </div>
      </ScrollReveal>
    </main>
  );
};

export default Categories;
