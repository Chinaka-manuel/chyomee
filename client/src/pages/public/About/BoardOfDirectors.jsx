// ...existing code...

const BoardOfDirectors = () => {
  const directors = [
    {
      name: "Fortune Niceman",
      role: "Chairman / Director",
      image: "/images/team/11.jpg",
    },
    {
      name: "Niceman Himself",
      role: "Operations",
      image: "/images/team/13.jpg",
    },
    {
      name: "Hannah Ifiok",
      role: "Director",
      image: "/images/team/14.jpg",
    },
  ];

  return (
    <main className="bg-white text-slate-800">
      {/* Hero */}
      <section className="bg-green-800">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-3xl text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-200">
              chyomee
            </p>

            <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
              Board of Directors
            </h1>

            <p className="mt-6 text-lg leading-8 text-green-50">
              Providing strategic direction, oversight, and leadership for
              sustainable growth.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
            Leadership
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Strategic leadership and oversight
          </h2>

          <p className="mt-6 leading-8 text-slate-600">
            Our leadership provides strategic oversight and guidance,
            keeping chyomee focused on thoughtful growth, responsible
            business practices, and a welcoming shopping experience.
          </p>
        </div>
      </section>

      {/* Directors */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {directors.map((director) => (
              <div
                key={`${director.name}-${director.role}`}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                {/* Director Profile Image */}
                <div className="flex h-40 items-center justify-center bg-green-100 sm:h-72">
                  <img
                    src={director.image}
                    alt={director.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-3 sm:p-7">
                  <h3 className="text-base font-bold text-slate-900 sm:text-xl">
                    {director.name}
                  </h3>

                  <p className="mt-1 text-[11px] font-medium text-green-700 sm:mt-2 sm:text-base">
                    {director.role}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-600 sm:mt-4 sm:text-sm sm:leading-6">
                    Provides leadership, strategic guidance, and oversight
                    supporting the company's long-term objectives.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900">
          Leadership with purpose
        </h2>

        <p className="mt-5 leading-8 text-slate-600">
          Our directors work collectively to provide responsible oversight and
          support the continued growth of chyomee.
        </p>
      </section>
    </main>
  );
};

export default BoardOfDirectors;
