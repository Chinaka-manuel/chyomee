const sections = [
  {
    title: "1. Information we collect",
    paragraphs: [
      "Information you provide may include your name, email address, telephone number, account details, delivery address, messages to customer care, and preferences you save. When you place an order, we also receive order items, quantities, delivery details, payment status, and transaction references.",
      "For made-to-measure requests, we collect the garment style, fabric choice, fit notes, measurement values, and measurement unit you submit. Please provide measurements only for yourself or, if you are a parent or guardian, a child in your care. Do not include unrelated sensitive information in notes.",
      "Some technical information, such as browser and device details, service logs, and security events, may be processed when you use the website. Your browser also stores cart and saved-favourite information locally so those features work between visits.",
    ],
  },
  {
    title: "2. How we use information",
    paragraphs: [
      "We use information to create and secure accounts; confirm, fulfill, deliver, and support orders; process payments; respond to enquiries; manage returns or order issues; and provide the made-to-measure quote and tailoring service you request.",
      "We may also use information to maintain the website, prevent fraud and misuse, troubleshoot service issues, meet applicable legal obligations, and keep records of transactions and customer requests. We do not use your information for unrelated purposes without a lawful basis or notice where required.",
    ],
  },
  {
    title: "3. Legal grounds",
    paragraphs: [
      "Where data protection law requires a legal ground, we rely on the ground appropriate to the activity—for example, performing a purchase or service you request, meeting legal obligations, protecting the website and our users, or your consent where consent is required. You may withdraw consent where processing is based on consent; this does not affect processing that already took place.",
    ],
  },
  {
    title: "4. Payments and service providers",
    paragraphs: [
      "Payments are handled by our payment provider, including Paystack where available. Payment details are submitted directly to the payment provider; chyomee does not store full payment-card numbers or security codes. We receive payment confirmations and transaction references needed to reconcile orders.",
      "We share only information needed with service providers that help us operate the store, such as payment processing, delivery, hosting, email/customer support, and image delivery providers. Those providers process information for the services they provide. We may also disclose information when required by law, to protect rights and safety, or as part of a business transfer.",
    ],
  },
  {
    title: "5. Cookies and local storage",
    paragraphs: [
      "The site uses secure authentication cookies to keep you signed in and local browser storage for your shopping cart, saved favourites, and cookie-notice preference. These technologies support core site functionality. Your browser settings can limit storage, but doing so may prevent some features from working. If non-essential analytics or advertising technologies are introduced, we will update this section and request consent where required.",
    ],
  },
  {
    title: "6. Retention and security",
    paragraphs: [
      "We keep account, order, payment-reference, support, and tailoring-request information for as long as needed to provide the service, manage customer and legal obligations, resolve disputes, and protect the business. Retention periods depend on the type of record and applicable requirements. Local cart and favourite data remains in your browser until you remove it or clear browser storage.",
      "We use safeguards designed to protect information, including access controls and secure connections. No website or transmission method can be guaranteed completely secure; keep your password confidential and contact us if you believe your account has been accessed without permission.",
    ],
  },
  {
    title: "7. Your choices and rights",
    paragraphs: [
      "Depending on the law that applies to you, you may ask to access, correct, update, or delete personal information; object to or restrict certain processing; request a portable copy; or withdraw consent. Some records must be retained for order, accounting, security, or legal reasons. We may need to verify your identity before acting on a request.",
      "To exercise a privacy right or raise a concern, contact us using the details below. If you are in Nigeria, you may also have the right to complain to the Nigeria Data Protection Commission.",
    ],
  },
  {
    title: "8. Children’s information",
    paragraphs: [
      "Our store is intended for adults. A parent or legal guardian may submit a child’s measurements when requesting a children’s garment and is responsible for doing so appropriately. Children should not create an account or submit personal information on their own.",
    ],
  },
  {
    title: "9. International processing",
    paragraphs: [
      "Some service providers may process information in a country other than the one where you live. Where this occurs, we take steps required by applicable data protection law to protect information during transfer and processing.",
    ],
  },
  {
    title: "10. Changes and contact",
    paragraphs: [
      "We may update this policy when our services or legal requirements change. The effective date below indicates when this version was last updated. Material changes will be highlighted on this page or through another appropriate notice.",
    ],
  },
];

function PrivacyPolicy() {
  return (
    <main className="public-store min-h-screen px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <article className="mx-auto max-w-4xl">
        <header className="rounded-3xl border border-white/15 bg-black/70 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            chyomee · Legal
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-white sm:text-5xl">
            Privacy policy
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-stone-200">
            This policy explains how chyomee handles information when you browse
            our fashion store, place an order, contact us, or request a
            made-to-measure garment.
          </p>
          <p className="mt-5 text-sm text-stone-300">
            Effective date: November 2, 2026
          </p>
          <nav aria-label="Privacy policy contents" className="mt-8 border-t border-white/15 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-300">
              At a glance
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {sections.map(({ title }, index) => (
                <li key={title}>
                  <a
                    href={`#privacy-section-${index + 1}`}
                    className="inline-flex min-h-10 items-center rounded-full border border-white/15 bg-white/5 px-3 text-sm text-stone-100 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
                  >
                    {title.replace(/^\d+\.\s/, "")}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <div className="mt-6 space-y-4">
          {sections.map(({ title, paragraphs }, index) => (
            <section
              key={title}
              id={`privacy-section-${index + 1}`}
              className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-stone-200 shadow-lg shadow-black/10 backdrop-blur-xl sm:p-8"
            >
              <h2 className="font-serif text-xl font-semibold text-white sm:text-2xl">
                {title}
              </h2>
              <div className="mt-4 max-w-3xl space-y-4 text-base leading-7 text-stone-200">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-4 rounded-2xl border border-amber-200/20 bg-black/75 p-6 text-stone-100 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-8">
          <h2 className="font-serif text-xl font-semibold text-white sm:text-2xl">
            Contact our privacy team
          </h2>
          <p className="mt-3 leading-7 text-stone-200">
            For a privacy request or question, contact chyomee at{" "}
            <a
              href="mailto:support@nicemanagro.com"
              className="font-semibold text-amber-300 underline underline-offset-4 hover:text-amber-200"
            >
              support@nicemanagro.com
            </a>{" "}
            or write to 145 Aka Obot Idim Road, Uyo, Akwa Ibom State, Nigeria.
            Please do not send payment-card details by email.
          </p>
        </section>
      </article>
    </main>
  );
}

export default PrivacyPolicy;
