import { Link } from "react-router-dom";

const InPersonTraining = () => {
  return (
    <main className="bg-white text-slate-800">
      {/* Hero */}
      <section className="bg-green-800">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-200">
            chyomee Style Guides
          </p>

          <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            Wardrobe Care
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-green-50">
            Simple, practical tips to help you care for your clothes and make
            your favourite pieces last.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
            Thoughtful Care
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Keep your favourites looking their best
          </h2>

          <p className="mt-6 leading-8 text-slate-600">
            A little extra care can help your favourite garments look and feel
            their best wear after wear.
          </p>
        </div>

        {/* Training Features */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Read the Label",
              text: "Check care instructions before washing, drying, or ironing each piece.",
            },
            {
              title: "Wash with Care",
              text: "Choose the recommended settings and avoid overcrowding the wash.",
            },
            {
              title: "Dry Thoughtfully",
              text: "Air dry delicate garments when the care label recommends it.",
            },
            {
              title: "Store with Ease",
              text: "Fold knits and hang structured garments to help them keep their shape.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-slate-50 p-7"
            >
              <h3 className="text-xl font-bold text-green-800">
                {item.title}
              </h3>

              <p className="mt-4 leading-7 text-slate-600">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Training Areas */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Simple Care Habits
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Sort by Fabric",
              "Choose the Right Wash",
              "Protect Delicate Details",
              "Air Dry When Needed",
              "Store Knits Folded",
              "Refresh Between Wears",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl bg-white px-6 py-5 font-semibold text-slate-800 shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-800">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-white">
            Need help with a product?
          </h2>

          <p className="mt-4 leading-7 text-green-50">
            Contact our team for care information or help choosing the right
            piece.
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

export default InPersonTraining;