import { Link } from "react-router-dom";

const FarmerTraining = () => {
  return (
    <main className="bg-white text-slate-800">
      {/* Hero */}
      <section className="bg-green-800">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-200">
            chyomee Style Guides
          </p>

          <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            Styling Tips
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-green-50">
            Simple, practical ideas to help you get more from your wardrobe
            and put together outfits with confidence.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
            Everyday Inspiration
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Find your personal style
          </h2>

          <p className="mt-6 leading-8 text-slate-600">
            Getting dressed can be simple and expressive. Start with pieces
            that make you feel good, then build outfits around your routine.
          </p>

          <p className="mt-5 leading-8 text-slate-600">
            Explore ideas for pairing colours, choosing layers, and adding
            accessories to make each look feel like you.
          </p>
        </div>
      </section>

      {/* Training Areas */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Explore the Guides
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Build a Wardrobe",
                text: "Choose versatile pieces that work well together and suit your everyday life.",
              },
              {
                title: "Style with Colour",
                text: "Find colour combinations that feel natural, fresh, and personal.",
              },
              {
                title: "Everyday Outfits",
                text: "Put together comfortable looks for work, weekends, and everything in between.",
              },
              {
                title: "Layer with Ease",
                text: "Add depth and versatility with layers made for changing plans and weather.",
              },
              {
                title: "Care for Your Clothes",
                text: "Learn simple ways to care for your pieces and keep them looking their best.",
              },
              {
                title: "Finishing Touches",
                text: "Use accessories to add personality and bring an outfit together.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-7 shadow-sm"
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
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-800">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-white">
            Looking for a little styling help?
          </h2>

          <p className="mt-4 leading-7 text-green-50">
            Reach out to our team for help finding pieces and styling ideas.
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

export default FarmerTraining;