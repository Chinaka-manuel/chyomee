import { useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useAdmin } from "../../context/useAdmin";

const AdminLayout = () => {
  const location = useLocation();
  const { admin } = useAdmin();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  const adminName = admin?.userName || admin?.email || "Admin";

  const breadcrumbItems = (() => {
    const currentPath = location.pathname;
    const segments = currentPath
      .replace(/^\/admin\/?/, "")
      .split("/")
      .filter(Boolean);

    const routeMap = [
      { path: "/admin/dashboard", label: "Dashboard" },
      { path: "/admin/blog", label: "Blog Management" },
      { path: "/admin/blog/create", label: "Create Article" },
      { path: "/admin/blog/edit/:id", label: "Edit Article" },
      { path: "/admin/categories", label: "Categories" },
      { path: "/admin/categories/add", label: "Add Category" },
      { path: "/admin/categories/edit/:id", label: "Edit Category" },
      { path: "/admin/products", label: "Products" },
      { path: "/admin/products/add", label: "Add Product" },
      { path: "/admin/products/:id", label: "Product Details" },
      { path: "/admin/products/edit/:id", label: "Edit Product" },
      { path: "/admin/orders", label: "Orders" },
      { path: "/admin/tailoring", label: "Tailoring Requests" },
      { path: "/admin/orders/:id", label: "Order Details" },
      { path: "/admin/customers", label: "Customers" },
      { path: "/admin/customers/:id", label: "Customer Details" },
      { path: "/admin/inventory", label: "Inventory" },
      { path: "/admin/reviews", label: "Reviews" },
      { path: "/admin/promotions", label: "Promotions" },
      { path: "/admin/website-content", label: "Website Content" },
    ];

    const matchesRoute = (routePath, pathname) => {
      const routeSegments = routePath
        .replace(/^\/admin\/?/, "")
        .split("/")
        .filter(Boolean);
      const currentSegments = pathname
        .replace(/^\/admin\/?/, "")
        .split("/")
        .filter(Boolean);

      if (routeSegments.length > currentSegments.length) return false;

      return routeSegments.every((segment, index) => {
        const currentSegment = currentSegments[index];
        return segment === currentSegment || segment === ":id";
      });
    };

    const currentMatch = routeMap.find((route) =>
      matchesRoute(route.path, currentPath),
    ) || {
      path: "/admin/dashboard",
      label: "Dashboard",
    };

    const parentMatches = routeMap.filter((route) => {
      if (
        route.path === currentMatch.path ||
        route.path === "/admin/dashboard"
      ) {
        return false;
      }

      const routeSegments = route.path
        .replace(/^\/admin\/?/, "")
        .split("/")
        .filter(Boolean);
      const currentSegments = currentPath
        .replace(/^\/admin\/?/, "")
        .split("/")
        .filter(Boolean);

      if (routeSegments.length >= currentSegments.length) return false;

      return routeSegments.every((segment, index) => {
        const currentSegment = currentSegments[index];
        return segment === currentSegment || segment === ":id";
      });
    });

    const items = [
      {
        label: "Dashboard",
        to: "/admin/dashboard",
        current:
          currentMatch.path === "/admin/dashboard" || segments.length === 0,
      },
    ];

    const seen = new Set(["Dashboard"]);

    parentMatches.forEach((route) => {
      if (seen.has(route.label)) return;
      seen.add(route.label);
      items.push({
        label: route.label,
        to: route.path,
        current: false,
      });
    });

    if (
      currentMatch.path !== "/admin/dashboard" &&
      !seen.has(currentMatch.label)
    ) {
      items.push({
        label: currentMatch.label,
        to: null,
        current: true,
      });
    } else if (currentMatch.path !== "/admin/dashboard") {
      items[items.length - 1] = { ...items[items.length - 1], current: true };
    }

    return items;
  })();

  const initials = adminName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        isMobileOpen={mobileSidebarOpen}
        onClose={closeMobileSidebar}
        onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
      />

      <div
        className={`transition-all duration-200 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"}`}
      >
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarCollapsed((current) => !current)}
                className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-800 lg:inline-flex"
                aria-label="Toggle sidebar"
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-800 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div className="min-w-0 max-w-full">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-green-700">
                  Management
                </p>

                <nav
                  aria-label="Breadcrumb"
                  className="mt-1 min-w-0 max-w-full overflow-hidden"
                >
                  <ol className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-slate-500 sm:text-sm">
                    {breadcrumbItems.map((item, index) => (
                      <li
                        key={`${item.label}-${index}`}
                        className="flex min-w-0 items-center gap-1"
                      >
                        {item.to && !item.current ? (
                          <Link
                            to={item.to}
                            className="max-w-32 truncate rounded-md px-1 py-0.5 text-slate-600 transition hover:text-green-700 sm:max-w-44"
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <span className="max-w-32 truncate font-medium text-slate-700 sm:max-w-48">
                            {item.label}
                          </span>
                        )}

                        {index < breadcrumbItems.length - 1 && (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-800"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-800 text-xs font-bold text-white">
                  {initials}
                </div>

                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-800">
                    {adminName}
                  </p>
                  <p className="text-[11px] text-slate-500">Administrator</p>
                </div>

                <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
