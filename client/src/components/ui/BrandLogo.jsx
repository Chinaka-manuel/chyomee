function BrandLogo({ className = "h-8 w-auto" }) {
  return (
    <img
      src={import.meta.env.VITE_BRAND_LOGO_URL}
      alt="Chiomee"
      className={`block object-contain ${className}`}
    />
  );
}

export default BrandLogo;
