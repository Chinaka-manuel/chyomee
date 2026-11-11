import { useMemo, useState, useContext } from "react";
import { BlogContext } from "../context/BlogContext";
import { fashionImages } from "../data/fashionImages";

const dummyBlogs = [
  {
    id: 1,
    title: "How to Build a More Versatile Wardrobe",
    slug: "build-a-more-versatile-wardrobe",
    excerpt:
      "A thoughtful collection of easy-to-style pieces can make getting dressed feel effortless.",
    content:
      "Start with pieces you love wearing, choose colours that work together, and add considered layers and accessories. A versatile wardrobe is less about having more and more about finding combinations that feel like you.",
    category: "Style Advice",
    author: "chyomee Editorial",
    date: "October 2, 2026",
    readTime: "5 min read",
    image: fashionImages[0],
  },

  {
    id: 2,
    title: "Simple Ways to Style Your Favourite Shirt",
    slug: "style-your-favourite-shirt",
    excerpt:
      "Explore easy combinations that take a favourite shirt from relaxed days to polished plans.",
    content:
      "Try a half-tuck with tailored trousers, layer an open shirt over a simple top, or add a statement accessory. Small styling changes can give a familiar piece a completely new feel.",
    category: "Outfit Inspiration",
    author: "chyomee Editorial",
    date: "September 28, 2026",
    readTime: "4 min read",
    image: fashionImages[1],
  },

  {
    id: 3,
    title: "A Little Guide to Accessorising",
    slug: "guide-to-accessorising",
    excerpt:
      "Finish an outfit with thoughtful accessories that feel personal, not overdone.",
    content:
      "Start with one focal piece, then keep the rest of your accessories simple. Consider proportion, colour, and the occasion to find a balance that feels natural and entirely your own.",
    category: "Style Advice",
    author: "chyomee Editorial",
    date: "September 20, 2026",
    readTime: "6 min read",
    image: fashionImages[2],
  },

  {
    id: 4,
    title: "What to Look for in an Everyday Bag",
    slug: "choose-an-everyday-bag",
    excerpt:
      "From a practical crossbody to a roomy carryall, find a bag that fits your day and your style.",
    content:
      "Think about what you carry most, how you like to organise it, and which shape works with your wardrobe. A comfortable strap and a versatile colour can make an everyday bag a true favourite.",
    category: "Style Advice",
    author: "chyomee Editorial",
    date: "September 15, 2026",
    readTime: "5 min read",
    image: fashionImages[3],
  },

  {
    id: 5,
    title: "How to Care for Your Favourite Fabrics",
    slug: "care-for-your-favourite-fabrics",
    excerpt:
      "A few thoughtful care habits can help your most-loved pieces look their best for longer.",
    content:
      "Always check the care label before washing. Use the recommended temperature, avoid overfilling the machine, and allow delicate pieces to air dry when appropriate. Thoughtful storage helps garments keep their shape between wears.",
    category: "Care Guide",
    author: "chyomee Editorial",
    date: "September 10, 2026",
    readTime: "4 min read",
    image: fashionImages[0],
  },

  {
    id: 6,
    title: "A Guide to Effortless Layering",
    slug: "guide-to-effortless-layering",
    excerpt:
      "Build dimension into your look with comfortable layers and pieces that work together.",
    content:
      "Begin with a simple base, add a light layer for texture, and finish with an outer layer suited to the weather. Mixing proportions and textures can make a simple outfit feel considered without losing comfort.",
    category: "Outfit Inspiration",
    author: "chyomee Editorial",
    date: "September 5, 2026",
    readTime: "7 min read",
    image: fashionImages[1],
  },
];

function useBlog() {
  const ctx = useContext(BlogContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const source = ctx?.posts || dummyBlogs;

  const categories = useMemo(() => {
    return ["All", ...new Set(source.map((blog) => blog.category))];
  }, [source]);

  const filteredBlogs = useMemo(() => {
    return source.filter((blog) => {
      const matchesCategory =
        selectedCategory === "All" || blog.category === selectedCategory;

      const search = searchTerm.toLowerCase();

      const matchesSearch =
        (blog.title || "").toLowerCase().includes(search) ||
        (blog.excerpt || "").toLowerCase().includes(search) ||
        (blog.category || "").toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory, source]);

  const getBlogBySlug = (slug) => {
    return source.find(
      (blog) => blog.slug === slug || String(blog.id) === String(slug),
    );
  };

  return {
    blogs: filteredBlogs,
    allBlogs: source,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    getBlogBySlug,
  };
}

export default useBlog;
