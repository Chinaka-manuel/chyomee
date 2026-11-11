// ...existing code...

const ManagementTeam = () => {
  const team = [
    // {
    //   name: "",
    //   role: "Head of Training/Workshop",
    //   image: "/images/team/ben.jpg",
    // },
    {
      name: "Nsisong B. Udofia",
      role: "Founder and CEO",
      image: "/images/team/13.jpg",
    },
    {
      name: "Fortune Nkine",
      role: "Cofounder and COO",
      image: "/images/team/11.jpg",
    },
    // {
    //   name: "Ben G",
    //   role: "Head of Training/Workshop",
    //   image: "/images/team/ben.jpg",
    // },
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
              Management Team
            </h1>

            <p className="mt-6 text-lg leading-8 text-green-50">
              A dedicated team creating a thoughtful and welcoming fashion
              shopping experience.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
            Our People
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            The people behind our operations
          </h2>

          <p className="mt-6 leading-8 text-slate-600">
            Our management team brings together leadership, operational
            experience, and business expertise to support chyomee and our
            customers.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div
                key={`${member.name}-${member.role}`}
                className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {/* Profile Image */}
                <div className="flex h-40 items-center justify-center bg-green-100 sm:h-64">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-3 sm:p-6">
                  <h3 className="text-base font-bold text-slate-900 sm:text-xl">
                    {member.name}
                  </h3>

                  <p className="mt-1 text-[11px] font-medium text-green-700 sm:mt-2 sm:text-base">
                    {member.role}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-600 sm:mt-4 sm:text-sm sm:leading-6">
                    Supporting the company's operations and contributing to
                    thoughtful growth and an excellent customer experience.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-900">Leadership</h3>
            <p className="mt-4 leading-7 text-slate-600">
              Providing clear direction and making responsible decisions.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-900">Collaboration</h3>
            <p className="mt-4 leading-7 text-slate-600">
              Working together across different areas of the business.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-900">Excellence</h3>
            <p className="mt-4 leading-7 text-slate-600">
              Continuously improving our operations, products, and services.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ManagementTeam;
