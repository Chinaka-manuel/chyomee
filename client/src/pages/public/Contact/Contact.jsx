import { useState } from "react";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { sendContactMessage } from "../../../services/contactService";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback({ type: "", message: "" });
    try {
      const result = await sendContactMessage(form);
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setFeedback({
        type: "",
        message: "",
      });
      setSuccessMessage(
        result.message || "Your message was sent successfully.",
      );
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Unable to send your message. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-white text-slate-800">
      {/* Hero */}
      <section className="bg-green-800">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-3xl text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-200">
              chyomee
            </p>

            <h1 className="mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
              Contact Us
            </h1>

            <p className="mt-6 text-lg leading-8 text-green-50">
              Have a question, enquiry, or business opportunity? We would love
              to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Information */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
              Get In Touch
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              We are here to help
            </h2>

            <p className="mt-6 leading-8 text-slate-600">
              Whether you need help with an order, a product, sizing, or
              delivery, our team is happy to help.
            </p>

            <div className="mt-10 space-y-7">
              {/* Address */}
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <MapPin size={20} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">Our Location</h3>
                  <p className="mt-1 text-slate-600">
                    chyomee
                    <br />
                    145 Aka Obot Idim Road, Uyo Akwa Ibom State
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <Phone size={20} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">Phone 1</h3>
                  <a
                    href="tel:+234 812 797 1171"
                    className="mt-1 block text-slate-600 hover:text-green-700"
                  >
                    +234 812 797 1171 ,
                  </a>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Phone 2</h3>
                  <a
                    href="tel:+234 808 801 1217"
                    className="mt-1 block text-slate-600 hover:text-green-700"
                  >
                    +234 808 801 1217
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <Mail size={20} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">Email</h3>
                  <a
                    href="mailto:support@nicemanagro.com"
                    className="mt-1 block text-slate-600 hover:text-green-700"
                  >
                    support@nicemanagro.com
                  </a>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <Clock3 size={20} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">Business Hours</h3>
                  <p className="mt-1 text-slate-600">
                    Monday – Friday: 8:00 AM – 8:00 PM
                    <br />
                    Saturday: 9:00 AM – 7:30 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-3xl bg-slate-50 p-8 shadow-sm lg:p-10">
            <h2 className="text-2xl font-bold text-slate-900">
              Send Us a Message
            </h2>

            <p className="mt-2 text-slate-600">
              Fill out the form below and our team will get back to you.
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  maxLength={120}
                  required
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  maxLength={254}
                  required
                  placeholder="Enter your email address"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  maxLength={40}
                  placeholder="phone number"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Subject
                </label>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  maxLength={160}
                  required
                  placeholder="What is your enquiry about?"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={form.message}
                  onChange={handleChange}
                  maxLength={5000}
                  required
                  placeholder="Write your message..."
                  className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                ></textarea>
              </div>

              {feedback.type === "error" && feedback.message && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {feedback.message}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-wait disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-800">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-white">Let's grow together</h2>

          <p className="mt-4 leading-7 text-green-50">
            We are always happy to hear from our customers, partners, and
            community.
          </p>
        </div>
      </section>

      {successMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="contact-success-title"
            aria-describedby="contact-success-message"
            className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl"
          >
            <div
              aria-hidden="true"
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700"
            >
              ✓
            </div>
            <h2
              id="contact-success-title"
              className="mt-5 text-2xl font-bold text-slate-900"
            >
              Message sent successfully
            </h2>
            <p
              id="contact-success-message"
              className="mt-3 text-slate-600"
            >
              {successMessage}
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => setSuccessMessage("")}
              className="mt-6 rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-700/20"
            >
              Close
            </button>
          </section>
        </div>
      )}
    </main>
  );
};

export default Contact;
