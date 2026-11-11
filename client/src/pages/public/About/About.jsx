import { Link } from "react-router-dom";
import { fashionImages } from "../../../data/fashionImages";

const About = () => {
  return (
    <section
      className="relative min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          `url("${fashionImages[2]}")`,
      }}
    >
      {/* Dark/green overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* About Mega Menu */}
      <div className="relative z-10 mx-auto flex w-[75%] max-w-6xl">
        {/* Left Column */}
        <div className="w-1/2 rounded-bl-lg bg-[#659d7d] shadow-lg">
          <Link
            to="/about/company"
            className="flex items-center justify-between px-8 py-14 text-3xl font-semibold text-white transition hover:bg-white/10"
          >
            Our Company
            <span className="text-4xl">›</span>
          </Link>

          <Link
            to="/about/governance"
            className="flex items-center justify-between px-8 py-14 text-3xl font-semibold text-white transition hover:bg-white/10"
          >
            Governance Structure
            <span className="text-4xl">›</span>
          </Link>

          <Link
            to="/about/facilities"
            className="block px-8 py-14 text-3xl font-semibold text-white transition hover:bg-white/10"
          >
            Our Facilities
          </Link>
        </div>

        {/* Right Column */}
        <div className="w-1/2 rounded-br-lg bg-[#659d7d] shadow-lg">
          <Link
            to="/about/story"
            className="block px-8 py-14 text-3xl font-semibold text-white transition hover:bg-white/10"
          >
            Our Story
          </Link>

          <Link
            to="/about/highlights"
            className="block px-8 py-14 text-3xl font-semibold text-white transition hover:bg-white/10"
          >
            Our Highlights
          </Link>

          <Link
            to="/about/values"
            className="block px-8 py-14 text-3xl font-semibold text-white transition hover:bg-white/10"
          >
            Core Values
          </Link>

          <Link
            to="/about/purpose"
            className="block px-8 py-14 text-3xl font-semibold text-white transition hover:bg-white/10"
          >
            Our Purpose
          </Link>

          <Link
            to="/about/people"
            className="block px-8 py-14 text-3xl font-semibold text-white transition hover:bg-white/10"
          >
            Our People
          </Link>

          <Link
            to="/about/future"
            className="block px-8 py-14 text-3xl font-semibold text-white transition hover:bg-white/10"
          >
            Our Future
          </Link>
        </div>
      </div>

      {/* Hero Text */}
      <div className="absolute bottom-20 left-10 z-10 text-white">
        <p className="mb-3 text-lg font-semibold tracking-[0.3em]">
          ABOUT US
        </p>

        <h1 className="font-serif text-7xl font-medium leading-none md:text-9xl">
          Who We Are
        </h1>
      </div>
    </section>
  );
};

export default About;