export const fashionImages = [
  import.meta.env.VITE_FASHION_IMAGE_1,
  import.meta.env.VITE_FASHION_IMAGE_2,
  import.meta.env.VITE_FASHION_IMAGE_3,
  import.meta.env.VITE_FASHION_IMAGE_4,
];

export const getFashionImage = (index = 0) =>
  fashionImages[Math.abs(Number(index) || 0) % fashionImages.length];
