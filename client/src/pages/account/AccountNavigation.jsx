import { NavLink } from "react-router-dom";
import { Heart, Scissors, ShoppingBag, User } from "lucide-react";

const accountNavItems = [
  { to: "/account", label: "Dashboard", icon: User, end: true },
  { to: "/account/profile", label: "My Profile", icon: User },
  { to: "/account/orders", label: "My Orders", icon: ShoppingBag },
  { to: "/account/tailoring", label: "Tailoring", icon: Scissors },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart },
];

function AccountNavigation() {
  return (
    <nav className="sticky top-0 z-20 mb-8 rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto sm:scroll-pb-2">
        {accountNavItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              `inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2 py-2 text-[11px] font-medium transition sm:flex-none sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm ${
                isActive
                  ? "bg-green-50 font-semibold text-green-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-green-700"
              }`
            }
          >
            <Icon size={16} className="shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default AccountNavigation;
