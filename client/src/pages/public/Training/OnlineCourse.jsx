import { Link } from "react-router-dom";

const OnlineCourses = () => {
  return (
    <main className="bg-white text-slate-800">
      {/* Hero */}
      <section className="bg-green-800">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-200">
            chyomee Style Guides
          </p>

          <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            Outfit Inspiration
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-green-50">
            Find fresh outfit ideas and practical styling tips whenever
            inspiration strikes.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
            Style Ideas
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Make everyday styling your own
          </h2>

          <p className="mt-6 leading-8 text-slate-600">
            Start with a favourite piece, experiment with simple combinations,
            and discover looks that suit your day.
          </p>
        </div>

        {/* Course Areas */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Easy Everyday Outfits",
            "Colour Pairing",
            "Effortless Layering",
            "Wardrobe Essentials",
            "Accessorising with Ease",
            "Occasion Dressing",
          ].map((course) => (
            <div
              key={course}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 font-bold text-green-800">
                ✓
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                {course}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Explore practical tips and inspiration for building a look that
                feels like you.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-800">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-white">
            Find your next favourite look
          </h2>

          <p className="mt-4 leading-7 text-green-50">
            Browse the collection or contact us for help with styling and
            product questions.
          </p>

          <Link
            to="/contact"
            className="mt-8 inline-block rounded-lg bg-white px-7 py-3 font-semibold text-green-800 hover:bg-green-50"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
};

export default OnlineCourses;