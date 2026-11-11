const logoUrl =
  "https://res.cloudinary.com/dybaoehch/image/upload/v1793630175/Chiomeewhite_ajlcl7.png";

function BrandLogo({ className = "h-8 w-auto" }) {
  return (
    <img
      src={logoUrl}
      alt="chyomee"
      className={`block object-contain ${className}`}
    />
  );
}

export default BrandLogo;
