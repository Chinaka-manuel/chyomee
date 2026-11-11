import { Link } from "react-router-dom";

const Workshops = () => {
  const workshops = [
    {
      title: "Everyday Outfit Ideas",
      description:
        "Explore easy combinations for the moments that make up your everyday.",
    },
    {
      title: "Colour and Contrast",
      description:
        "Find colours and contrasts that bring personality to your wardrobe.",
    },
    {
      title: "Accessories Made Simple",
      description:
        "Learn how thoughtful accessories can pull a look together without overcomplicating it.",
    },
    {
      title: "Build a Versatile Wardrobe",
      description:
        "Discover pieces that mix and match, so getting dressed feels easier.",
    },
    {
      title: "Care for Your Favourite Pieces",
      description:
        "Pick up simple garment-care habits that help your favourites stay in rotation.",
    },
    {
      title: "Effortless Layering",
      description:
        "Experiment with layers, textures, and proportions for a look that feels considered.",
    },
  ];

  return (
    <main className="bg-white text-slate-800">
      {/* Hero Section */}
      <section className="bg-green-800">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-3xl text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-200">
              chyomee Style Guides
            </p>

            <h1 className="mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
              Workshops
            </h1>

            <p className="mt-6 text-lg leading-8 text-green-50">
              Explore fashion inspiration and practical tips for dressing,
              styling, and caring for your wardrobe.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
            Practical Learning
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Learn, develop, and grow
          </h2>

          <p className="mt-6 leading-8 text-slate-600">
            Our style guides offer practical ideas you can adapt to your own
            wardrobe and daily routine.
          </p>

          <p className="mt-5 leading-8 text-slate-600">
            Find inspiration for new combinations, get to know the details that
            make an outfit feel personal, and care for the pieces you love.
          </p>
        </div>
      </section>

      {/* Workshop Areas */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
              Workshop Areas
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Explore our workshops
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workshops.map((workshop) => (
              <div
                key={workshop.title}
                className="rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-800">
                  +
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  {workshop.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
                  {workshop.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Attend */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
              Who Can Attend?
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Inspiration for every kind of wardrobe
            </h2>

            <p className="mt-6 leading-8 text-slate-600">
              Whether you are refreshing your everyday style or looking for a
              new occasion look, our guides are here to help you explore.
            </p>
          </div>

          <div className="rounded-3xl bg-green-50 p-8 lg:p-10">
            <ul className="space-y-5">
              {[
                "Everyday outfit inspiration",
                "Easy styling ideas",
                "Wardrobe essentials",
                "Accessories and finishing touches",
                "Simple garment-care tips",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-slate-700"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-700 text-sm font-bold text-white">
                    ✓
                  </span>

                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-800">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Interested in our workshops?
          </h2>

          <p className="mt-4 leading-7 text-green-50">
            Contact chyomee if you have questions about our style guides or
            collection.
          </p>

          <Link
            to="/contact"
            className="mt-8 inline-block rounded-lg bg-white px-7 py-3 font-semibold text-green-800 transition hover:bg-green-50"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Workshops;