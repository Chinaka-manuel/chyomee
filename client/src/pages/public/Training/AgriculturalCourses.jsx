import { Link } from "react-router-dom";

const AgriculturalCourses = () => {
  return (
    <main className="bg-white text-slate-800">
      {/* Hero */}
      <section className="bg-green-800">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-200">
            chyomee Style Guides
          </p>

          <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            Style Guides
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-green-50">
            Find practical inspiration for building outfits, caring for your
            wardrobe, and making personal style your own.
          </p>
        </div>
      </section>

      {/* Courses */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
            Explore Style
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Choose how you want to learn
          </h2>

          <p className="mt-6 leading-8 text-slate-600">
            Explore quick, useful guides with ideas you can bring into your
            everyday wardrobe.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {/* Online */}
          <Link
            to="/training/courses/online"
            className="group rounded-2xl border border-slate-200 p-8 shadow-sm transition hover:-translate-y-1 hover:border-green-600 hover:shadow-md"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
              Find Your Look
            </p>

            <h3 className="mt-3 text-2xl font-bold text-slate-900 group-hover:text-green-700">
              Outfit Inspiration
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Discover outfit ideas, simple combinations, and ways to style
              your favourite pieces.
            </p>

            <span className="mt-6 inline-block font-semibold text-green-700">
              Explore Style Ideas →
            </span>
          </Link>

          {/* In Person */}
          <Link
            to="/training/courses/in-person"
            className="group rounded-2xl border border-slate-200 p-8 shadow-sm transition hover:-translate-y-1 hover:border-green-600 hover:shadow-md"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
              Care and Confidence
            </p>

            <h3 className="mt-3 text-2xl font-bold text-slate-900 group-hover:text-green-700">
              Wardrobe Care
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Get practical tips for caring for your clothes and keeping the
              pieces you love looking their best.
            </p>

            <span className="mt-6 inline-block font-semibold text-green-700">
              Explore Care Guides →
            </span>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Need more information?
          </h2>

          <p className="mt-4 text-slate-600">
            Need help finding the right look or item? Our team is happy to help.
          </p>

          <Link
            to="/contact"
            className="mt-7 inline-block rounded-lg bg-green-700 px-7 py-3 font-semibold text-white hover:bg-green-800"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
};

export default AgriculturalCourses;