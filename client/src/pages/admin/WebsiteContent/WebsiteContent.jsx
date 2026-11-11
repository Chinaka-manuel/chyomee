import { useEffect, useState } from "react";
import {
  getWebsiteContent,
  updateWebsiteContent,
} from "../../../services/adminService";
import { fashionImages } from "../../../data/fashionImages";
import { handleLocalImageUpload } from "../../../utils/localImageUpload";

const buildHeroSlides = (heroData = {}) => {
  const hero = heroData && typeof heroData === "object" ? heroData : {};
  const legacySlides = Array.isArray(hero.slides)
    ? hero.slides.slice(0, 2)
    : [];

  const normalized = [
    {
      title: legacySlides[0]?.title ?? hero.title ?? "",
      subtitle: legacySlides[0]?.subtitle ?? hero.subtitle ?? "",
      image: legacySlides[0]?.image ?? hero.image ?? "",
    },
    {
      title: legacySlides[1]?.title ?? "",
      subtitle: legacySlides[1]?.subtitle ?? "",
      image: legacySlides[1]?.image ?? "",
    },
  ];

  return normalized;
};

const normalizeHeroPayload = (heroData = {}) => {
  const hero = heroData && typeof heroData === "object" ? heroData : {};
  const slides = buildHeroSlides(hero);
  const slideOne = slides[0] ?? {};

  return {
    ...hero,
    slides,
    title: slideOne.title ?? hero.title ?? "",
    subtitle: slideOne.subtitle ?? hero.subtitle ?? "",
    image: slideOne.image ?? hero.image ?? "",
  };
};

export default function WebsiteContent() {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState({});

  const [content, setContent] = useState({
    hero: {
      title: "Find your everyday style",
      subtitle: "Thoughtful pieces for every day and every occasion.",
      image: fashionImages[0],
      slides: [
        {
          title: "Find your everyday style",
          subtitle: "Thoughtful pieces for every day and every occasion.",
          image: fashionImages[0],
        },
        {
          title: "Wear what moves you",
          subtitle: "Explore new favourites for every part of your day.",
          image: fashionImages[1],
        },
      ],
    },

    about: {
      title: "About chyomee",
      description:
        "Discover a thoughtful fashion collection, selected to make everyday dressing feel personal and effortless.",
      image: fashionImages[2],
    },

    contact: {
      phone: "+234 801 234 5678",
      email: "info@nicemanagro.com",
      address: "Lagos, Nigeria",
      whatsapp: "+234 801 234 5678",
    },

    footer: {
      description: "Considered fashion, delivered to your doorstep.",
      copyright: "© 2026 chyomee. All rights reserved.",
    },
  });

  useEffect(() => {
    getWebsiteContent()
      .then(({ data }) => {
        if (data && Object.keys(data).length) {
          const nextHero = normalizeHeroPayload(data.hero ?? {});
          setContent((current) => ({
            ...current,
            ...data,
            hero: {
              ...current.hero,
              ...nextHero,
              slides: nextHero.slides,
            },
            about: { ...current.about, ...data.about },
            contact: { ...current.contact, ...data.contact },
            footer: { ...current.footer, ...data.footer },
          }));
        }
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const updateHeroSlide = (index, field, value) => {
    setContent((current) => {
      const hero = current.hero || {};
      const nextSlides = Array.isArray(hero.slides)
        ? [...hero.slides].slice(0, 2)
        : [];

      while (nextSlides.length < 2) {
        nextSlides.push({
          title: "",
          subtitle: "",
          image: "",
        });
      }

      nextSlides[index] = {
        ...(nextSlides[index] || {}),
        [field]: value,
      };

      const slideOne = nextSlides[0] || {};
      const nextHero = {
        ...hero,
        slides: nextSlides,
        title: slideOne.title ?? hero.title ?? "",
        subtitle: slideOne.subtitle ?? hero.subtitle ?? "",
        image: slideOne.image ?? hero.image ?? "",
      };

      return {
        ...current,
        hero: nextHero,
      };
    });
  };

  const handleHeroImageUpload = async (index, event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    const uploadKey = `hero:${index}:image`;
    setError("");

    try {
      setUploadingImage((current) => ({ ...current, [uploadKey]: true }));
      const uploadedUrl = await handleLocalImageUpload(event, () => {});

      if (!uploadedUrl) {
        throw new Error("Image upload did not return a valid URL.");
      }

      updateHeroSlide(index, "image", uploadedUrl);
    } catch (requestError) {
      setError(
        requestError.message ||
          `Failed to upload Hero Slide ${index + 1} image.`,
      );
    } finally {
      setUploadingImage((current) => ({ ...current, [uploadKey]: false }));
    }
  };

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const heroSlides = Array.isArray(content.hero?.slides)
        ? content.hero.slides.map((slide) => ({
            title: slide?.title ?? "",
            subtitle: slide?.subtitle ?? "",
            image: slide?.image ?? "",
          }))
        : [];

      const payload = {
        ...content,
        hero: {
          ...(content.hero || {}),
          slides: heroSlides,
          title: heroSlides[0]?.title ?? "",
          subtitle: heroSlides[0]?.subtitle ?? "",
          image: heroSlides[0]?.image ?? "",
        },
      };

      await updateWebsiteContent(payload);
      setSaved(true);
      setError("");
    } catch (requestError) {
      setSaved(false);
      setError(
        requestError?.message
          ? `Hero content was not saved: ${requestError.message}`
          : "Hero content was not saved. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const isUploading = Object.values(uploadingImage).some(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Website Content</h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage only the homepage hero section.
        </p>
      </div>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-700">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="mb-4 text-sm text-green-700">
          Hero content saved successfully.
        </p>
      )}

      {/* Hero Section */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Hero Section</h2>
          <p className="mt-1 text-sm text-gray-500">
            Edit the main content displayed on the homepage.
          </p>
        </div>

        <div className="space-y-6">
          {[0, 1].map((index) => {
            const slide = content.hero?.slides?.[index] || {
              title: "",
              subtitle: "",
              image: "",
            };

            return (
              <div
                key={index}
                className="rounded-lg border border-gray-100 p-4"
              >
                <h3 className="mb-3 text-sm font-semibold text-gray-800">
                  Hero Slide {index + 1}
                </h3>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Heading
                    </label>

                    <input
                      type="text"
                      value={slide.title ?? ""}
                      onChange={(e) =>
                        updateHeroSlide(index, "title", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Subtitle
                    </label>

                    <textarea
                      rows="4"
                      value={slide.subtitle ?? ""}
                      onChange={(e) =>
                        updateHeroSlide(index, "subtitle", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Background Image
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleHeroImageUpload(index, e)}
                      className="w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 outline-none focus:border-green-600"
                    />

                    <p className="mt-2 text-xs text-gray-500">
                      {uploadingImage[`hero:${index}:image`]
                        ? "Uploading image…"
                        : "Choose a local image to upload."}
                    </p>

                    {slide.image && (
                      <div className="mt-4">
                        <p className="mb-2 text-sm font-medium text-gray-700">
                          Preview
                        </p>
                        <img
                          src={slide.image}
                          alt={`Hero slide ${index + 1} preview`}
                          className="h-48 w-full rounded-xl border border-gray-200 bg-gray-50 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || isUploading}
            className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-300"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
