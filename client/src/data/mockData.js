import { fashionImages } from "./fashionImages";

export const categoriesSeed = [
  {
    id: 1,
    name: "Clothing",
    slug: "clothing",
    description: "Wardrobe staples and standout pieces for every occasion.",
    image: fashionImages[0],
    status: "Active",
  },
  {
    id: 2,
    name: "Shoes",
    slug: "shoes",
    description: "Find the finishing touch with versatile, considered footwear.",
    image: fashionImages[1],
    status: "Active",
  },
  {
    id: 3,
    name: "Bags",
    slug: "bags",
    description: "Everyday carryalls and statement bags to complete your look.",
    image: fashionImages[2],
    status: "Active",
  },
  {
    id: 4,
    name: "Accessories",
    slug: "accessories",
    description: "The little details that make an outfit your own.",
    image: fashionImages[3],
    status: "Active",
  },
  {
    id: 5,
    name: "New Arrivals",
    slug: "new-arrivals",
    description: "Fresh additions, selected for the season ahead.",
    image: fashionImages[0],
    status: "Active",
  },
  {
    id: 6,
    name: "Sale",
    slug: "sale",
    description: "Discover considered finds at a little less.",
    image: fashionImages[1],
    status: "Active",
  },
];

export const productsSeed = [
  {
    id: 1,
    name: "Relaxed Linen Shirt",
    category: "Clothing",
    sku: "CHI-CLS-001",
    price: 35000,
    stock: 45,
    description: "A breathable linen shirt made for effortless everyday styling.",
    image: fashionImages[0],
    images: [fashionImages[0], fashionImages[1]],
    sizes: ["XS", "S", "M", "L", "XL"],
    status: "Active",
    featured: true,
  },
  {
    id: 2,
    name: "Everyday Leather Loafers",
    category: "Shoes",
    sku: "CHI-SHO-002",
    price: 65000,
    stock: 8,
    description: "A timeless loafer with a clean profile and comfortable fit.",
    image: fashionImages[1],
    images: [fashionImages[1], fashionImages[2]],
    sizes: ["40", "41", "42", "43", "44"],
    status: "Active",
    featured: true,
  },
  {
    id: 3,
    name: "Mini Crossbody Bag",
    category: "Bags",
    sku: "CHI-BAG-003",
    price: 42000,
    stock: 0,
    description: "A compact, versatile bag for your everyday essentials.",
    image: fashionImages[2],
    images: [fashionImages[2], fashionImages[3]],
    sizes: ["One Size"],
    status: "Active",
    featured: false,
  },
  {
    id: 4,
    name: "Sculpted Hoop Earrings",
    category: "Accessories",
    sku: "CHI-ACC-004",
    price: 18000,
    stock: 25,
    description: "Lightweight hoops with a sculptural, polished finish.",
    image: fashionImages[3],
    images: [fashionImages[3], fashionImages[0]],
    sizes: ["One Size"],
    status: "Active",
    featured: false,
  },
  {
    id: 5,
    name: "Soft Knit Cardigan",
    category: "New Arrivals",
    sku: "CHI-NEW-005",
    price: 52000,
    stock: 12,
    description: "A soft layering piece with an easy, relaxed silhouette.",
    image: fashionImages[0],
    images: [fashionImages[0], fashionImages[2]],
    sizes: ["XS", "S", "M", "L", "XL"],
    status: "Inactive",
    featured: false,
  },
];

export const ordersSeed = [
  {
    id: "CHI-2026-00125",
    customer: {
      name: "Ukpono Ekom",
      email: "ukpono@gmail.com",
      phone: "+234 801 234 5678",
      address: "12 Market Road, Lagos, Nigeria",
    },
    date: "October 6, 2026",
    status: "Processing",
    paymentMethod: "Paystack",
    paymentStatus: "Paid",
    items: [
      { id: 1, name: "Relaxed Linen Shirt", quantity: 2, price: 35000 },
      { id: 2, name: "Everyday Leather Loafers", quantity: 1, price: 65000 },
    ],
  },
  {
    id: "CHI-2026-00124",
    customer: {
      name: "Sarah Williams",
      email: "sarah@example.com",
      phone: "+234 803 456 7890",
      address: "45 Market Street, Lagos, Nigeria",
    },
    date: "October 5, 2026",
    status: "Delivered",
    paymentMethod: "Paystack",
    paymentStatus: "Paid",
    items: [
      { id: 2, name: "Everyday Leather Loafers", quantity: 1, price: 65000 },
      { id: 5, name: "Soft Knit Cardigan", quantity: 2, price: 52000 },
    ],
  },
  {
    id: "CHI-2026-00123",
    customer: {
      name: "Michael Johnson",
      email: "michael@example.com",
      phone: "+234 805 678 9012",
      address: "78 Garden Avenue, Lagos, Nigeria",
    },
    date: "October 5, 2026",
    status: "Pending",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    items: [{ id: 4, name: "Sculpted Hoop Earrings", quantity: 1, price: 18000 }],
  },
  {
    id: "CHI-2026-00122",
    customer: {
      name: "Grace Okafor",
      email: "grace@example.com",
      phone: "+234 806 789 0123",
      address: "22 Market Lane, Lagos, Nigeria",
    },
    date: "October 4, 2026",
    status: "Delivered",
    paymentMethod: "Paystack",
    paymentStatus: "Paid",
    items: [
      { id: 3, name: "Mini Crossbody Bag", quantity: 2, price: 42000 },
      { id: 5, name: "Soft Knit Cardigan", quantity: 2, price: 52000 },
    ],
  },
  {
    id: "CHI-2026-00121",
    customer: {
      name: "David Williams",
      email: "david@example.com",
      phone: "+234 807 890 1234",
      address: "11 City Road, Lagos, Nigeria",
    },
    date: "October 3, 2026",
    status: "Cancelled",
    paymentMethod: "Paystack",
    paymentStatus: "Paid",
    items: [
      { id: 1, name: "Relaxed Linen Shirt", quantity: 1, price: 35000 },
      { id: 3, name: "Mini Crossbody Bag", quantity: 3, price: 42000 },
    ],
  },
];

export const customersSeed = [
  {
    id: 1,
    name: "Mabel Richards",
    email: "mabel@example.com",
    phone: "+234 801 234 5678",
    orders: 8,
    totalSpent: 245000,
    status: "Active",
  },
  {
    id: 2,
    name: "Sarah Williams",
    email: "sarah@example.com",
    phone: "+234 803 456 7890",
    orders: 12,
    totalSpent: 380000,
    status: "Active",
  },
  {
    id: 3,
    name: "Michael Johnson",
    email: "michael@example.com",
    phone: "+234 805 678 9012",
    orders: 5,
    totalSpent: 125000,
    status: "Active",
  },
  {
    id: 4,
    name: "Grace Okafor",
    email: "grace@example.com",
    phone: "+234 806 789 0123",
    orders: 3,
    totalSpent: 87000,
    status: "Inactive",
  },
];

export const blogPostsSeed = [
  {
    id: 1,
    title: "5 Ways to Build a More Versatile Wardrobe",
    category: "Style Advice",
    author: "Admin",
    date: "Oct 2, 2026",
    status: "Published",
  },
  {
    id: 2,
    title: "How to Care for Your Favourite Fabrics",
    category: "Care Guide",
    author: "Admin",
    date: "Sep 28, 2026",
    status: "Published",
  },
  {
    id: 3,
    title: "A Guide to Effortless Everyday Styling",
    category: "Style Advice",
    author: "Admin",
    date: "Sep 20, 2026",
    status: "Draft",
  },
];

export const promotionsSeed = [
  {
    id: 1,
    name: "New Season Offer",
    code: "STYLE20",
    type: "Percentage",
    value: 20,
    startDate: "Oct 1, 2026",
    endDate: "Oct 15, 2026",
    usage: 34,
    status: "Active",
  },
  {
    id: 2,
    name: "New Customer Discount",
    code: "WELCOME10",
    type: "Percentage",
    value: 10,
    startDate: "Sep 1, 2026",
    endDate: "Dec 31, 2026",
    usage: 58,
    status: "Active",
  },
  {
    id: 3,
    name: "Wardrobe Refresh",
    code: "EDIT5000",
    type: "Fixed",
    value: 5000,
    startDate: "Sep 20, 2026",
    endDate: "Oct 10, 2026",
    usage: 21,
    status: "Active",
  },
  {
    id: 4,
    name: "End of Season Edit",
    code: "SEASON25",
    type: "Percentage",
    value: 25,
    startDate: "Aug 1, 2026",
    endDate: "Aug 31, 2026",
    usage: 76,
    status: "Expired",
  },
];

export const reviewsSeed = [
  {
    id: 1,
    type: "general",
    customer: "Ifiok Abaiama",
    email: "ifiok@example.com",
    rating: 5,
    review: "Beautiful quality and an easy fit. I'll definitely order again.",
    comment: "Beautiful quality and an easy fit. I'll definitely order again.",
    date: "Oct 5, 2026",
    status: "Approved",
    product: "General Experience",
    productName: "General Experience",
  },
  {
    id: 2,
    type: "general",
    customer: "Sarah Williams",
    email: "sarah@example.com",
    rating: 4,
    review: "Lovely finish and quick delivery.",
    comment: "Lovely finish and quick delivery.",
    date: "Oct 4, 2026",
    status: "Approved",
    product: "General Experience",
    productName: "General Experience",
  },
  {
    id: 3,
    type: "product",
    customer: "Michael Johnson",
    email: "michael@example.com",
    product: "Sculpted Hoop Earrings",
    productName: "Sculpted Hoop Earrings",
    productId: 3,
    rating: 3,
    review: "The style was lovely, though delivery took longer than expected.",
    comment: "The style was lovely, though delivery took longer than expected.",
    date: "Oct 3, 2026",
    status: "Pending",
  },
  {
    id: 4,
    type: "general",
    customer: "Grace Okafor",
    email: "grace@example.com",
    rating: 2,
    review: "The colour was a little different from what I expected.",
    comment: "The colour was a little different from what I expected.",
    date: "Oct 2, 2026",
    status: "Pending",
    product: "General Experience",
    productName: "General Experience",
  },
  {
    id: 5,
    type: "general",
    customer: "David Williams",
    email: "david@example.com",
    rating: 5,
    review: "Excellent quality. Everything arrived beautifully packaged.",
    comment: "Excellent quality. Everything arrived beautifully packaged.",
    date: "Oct 1, 2026",
    status: "Approved",
    product: "General Experience",
    productName: "General Experience",
  },
];

export const websiteContentSeed = {
  hero: {
    // Maintain backward-compatible top-level hero fields while introducing
    // a slides array so we can support multiple hero slides in the admin.
    // The existing content is preserved as Slide 1.
    slides: [
      {
        title: "Find your new favourite",
        subtitle: "Thoughtful fashion finds, delivered to your doorstep.",
        buttonText: "Shop Now",
        buttonLink: "/shop",
        image: fashionImages[0],
      },
      {
        title: "Make the everyday feel special",
        subtitle: "Explore a considered edit of clothing and accessories.",
        buttonText: "Learn More",
        buttonLink: "/about",
        image: fashionImages[1],
      },
    ],
    // Keep the original top-level keys for compatibility with existing
    // components that read `content.hero.title`, etc. These mirror Slide 1.
    title: "Find your new favourite",
    subtitle: "Thoughtful fashion finds, delivered to your doorstep.",
    buttonText: "Shop Now",
    buttonLink: "/shop",
    image: fashionImages[0],
  },
  about: {
    title: "About chyomee",
    description:
      "Discover a thoughtful fashion collection, selected to make everyday dressing feel personal and effortless.",
    image: fashionImages[1],
  },
  contact: {
    phone: "+234 8067030126",
    email: "info@nicemanagro.com",
    address: "Uyo, Nigeria",
    whatsapp: "+234 812 797 1171",
  },
  footer: {
    description: "Considered fashion, delivered to your doorstep.",
    copyright: "© 2026 chyomee. All rights reserved.",
  },
};

export function readLocalStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    const saved = window.localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved);
  } catch (error) {
    console.error(`Failed to read ${key} from localStorage`, error);
    return fallback;
  }
}

export function writeLocalStorage(key, value) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage`, error);
  }
}
