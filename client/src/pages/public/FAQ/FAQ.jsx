import { useState } from "react";
import { Link } from "react-router-dom";

const faqs = [
  {
    question: "What can I shop at chyomee?",
    answer:
      "Browse our curated fashion collection, including clothing, accessories, and finishing touches for everyday wear and special occasions.",
  },
  {
    question: "Can I order products online?",
    answer:
      "Yes. You can browse our products, add items to your cart and proceed through checkout to place an order.",
  },
  {
    question: "Can I order without creating an account?",
    answer:
      "Yes. Guest checkout is available, so you can place an order without creating a customer account.",
  },
  {
    question: "Where can I find outfit inspiration?",
    answer:
      "Visit our Style Guides for outfit ideas, styling tips, and inspiration for making your wardrobe work for you.",
  },
  {
    question: "How can I contact chyomee?",
    answer:
      "You can contact us through our Contact Us page using the contact information provided or by sending us a message through the contact form.",
  },
  {
    question: "Do you deliver orders?",
    answer:
      "Delivery options are available for eligible orders. Availability, cost, and estimated delivery time may depend on your location and the items in your order.",
  },
  {
    question: "How can I find a particular item?",
    answer:
      "Browse the shop by category or use search to find the pieces you have in mind.",
  },
  {
    question: "Can I ask about a larger order?",
    answer:
      "Please contact our team to discuss availability and options for larger orders.",
  },
  {
    question: "How can I choose the right size?",
    answer:
      "Check the product details for sizing information, and contact us if you need help deciding between sizes.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Available payment methods will be displayed during checkout. Payment options may vary depending on the customer's location and the available payment services.",
  },
  {
    question: "Can I return or exchange an item?",
    answer:
      "Return eligibility depends on the item and its condition. Please review our returns information or contact our support team for help.",
  },
  {
    question: "How do I care for my new pieces?",
    answer:
      "Follow the care instructions provided with each item. For product-specific questions, our team will be happy to help.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex((currentIndex) => (currentIndex === index ? null : index));
  };

  return (
    <main className="bg-white text-slate-800">
      {/* Hero Section */}
      <section className="bg-green-800">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-3xl text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-200">
              chyomee
            </p>

            <h1 className="mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
              Frequently Asked Questions
            </h1>

            <p className="mt-6 text-lg leading-8 text-green-50">
              Find answers about shopping, sizing, delivery, returns, and your
              chyomee account.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
            FAQ
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">
            Here are answers to some of the questions our customers commonly
            ask.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition hover:bg-green-50"
                >
                  <span className="text-base font-semibold text-slate-900 sm:text-lg">
                    {faq.question}
                  </span>

                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl font-medium text-green-800 transition-transform duration-200 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-200 px-6 py-5">
                    <p className="leading-7 text-slate-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-green-800">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-white">
            Still have questions?
          </h2>

          <p className="mt-4 leading-7 text-green-50">
            If you cannot find the answer you are looking for, feel free to
            contact our team.
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

export default FAQ;
