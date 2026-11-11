import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useCart } from "../../../context/CartContext";
import { getCartItemKey } from "../../../utils/cartItem";

const formatCurrency = (value) => `₦${Number(value).toLocaleString("en-NG")}`;

function Cart() {
  const {
    cartItems,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  const subtotal = cartTotal;
  const total = subtotal;

  const handleProceedToCheckout = () => {
    const validationMessage = (() => {
      if (!cartItems || cartItems.length === 0) {
        return "Your cart is empty. Add at least one product before proceeding to checkout.";
      }

      const invalidItem = cartItems.find(
        (item) =>
          !item ||
          !Number.isFinite(Number(item.quantity)) ||
          Number(item.quantity) <= 0,
      );

      if (invalidItem) {
        return "One or more items in your cart have an invalid quantity. Please update them before checkout.";
      }

      return "";
    })();

    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    navigate("/checkout", {
      state: {
        cartItems,
        subtotal,
        total,
      },
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <section className="bg-stone-900 px-4 py-12 text-white">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold md:text-4xl">Shopping Cart</h1>
          </div>
        </section>

        <main className="mx-auto max-w-7xl px-4 py-12">
          <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 text-stone-800">
              <ShoppingCart className="h-10 w-10" />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Your cart is empty
            </h2>

            <p className="mt-3 text-gray-600">
              You haven&apos;t added anything yet. Browse the collection to find your next favourite.
            </p>

            <Link
              to="/shop"
              className="mt-7 inline-flex items-center gap-2 bg-stone-900 px-6 py-3 font-semibold text-white transition hover:bg-stone-700"
            >
              <ArrowLeft className="h-5 w-5" />
              Continue Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="bg-stone-900 px-4 py-12 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <h1 className="text-3xl font-bold md:text-4xl">Shopping Cart</h1>
          <button
            type="button"
            onClick={clearCart}
            className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <Trash2 size={16} />
            Clear cart
          </button>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(260px,0.9fr)] lg:items-start">
          <div className="space-y-3 min-w-0">
            {cartItems.map((item) => (
              <div
                key={getCartItemKey(item)}
                className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:flex-row sm:gap-4 sm:p-3.5 md:flex-row md:items-center md:justify-between md:gap-4"
              >
                <div className="flex min-w-0 gap-3 sm:gap-4 md:w-full md:flex-1 md:items-center md:gap-4">
                  <div                   className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-stone-100 sm:h-24 sm:w-24 md:h-24 md:w-24">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain object-center p-1.5"
                    />
                  </div>

                  <div className="min-w-0 flex-1 md:flex md:items-center md:justify-between md:gap-5">
                    <div className="min-w-0 md:max-w-[18rem]">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500 sm:text-[11px]">
                        {item.category}
                      </p>
                      <h2 className="mt-1 wrap-break-word text-sm font-bold leading-5 text-slate-900 sm:text-base">
                        {item.name}
                      </h2>
                      {(item.selectedSize || item.selectedColor || item.selectedStyle) && (
                        <p className="mt-1 text-xs font-medium text-slate-600">
                          {[item.selectedSize && `Size: ${item.selectedSize}`,
                            item.selectedColor && `Color: ${item.selectedColor}`,
                            item.selectedStyle && `Style: ${item.selectedStyle}`]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-start justify-between gap-2 sm:gap-3 md:mt-0 md:items-center md:gap-4">
                      <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:gap-3 md:grid-cols-2 md:gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium text-slate-500 sm:text-[11px]">
                            Unit price
                          </p>
                          <p className="mt-1 text-xs font-bold text-stone-900 sm:text-sm">
                            {formatCurrency(item.price)}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="whitespace-nowrap text-[10px] font-medium text-slate-500 sm:text-[11px]">
                            Item total:
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-900 sm:text-sm">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>

                      <div className="hidden shrink-0 items-center gap-2 md:flex">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor, item.selectedStyle)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:border-stone-700 hover:text-stone-900 sm:h-9 sm:w-9"
                          aria-label={`Decrease quantity for ${item.name}`}
                        >
                          <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>

                        <span className="flex h-8 min-w-[2.1rem] items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-1 text-sm font-semibold text-slate-800 sm:h-9 sm:min-w-[2.3rem]">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor, item.selectedStyle)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:border-stone-700 hover:text-stone-900 sm:h-9 sm:w-9"
                          aria-label={`Increase quantity for ${item.name}`}
                        >
                          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-21 flex flex-wrap items-center justify-between gap-3 sm:ml-0 sm:justify-end md:ml-0">
                  <div className="flex items-center gap-2 md:hidden">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor, item.selectedStyle)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:border-stone-700 hover:text-stone-900"
                      aria-label={`Decrease quantity for ${item.name}`}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>

                    <span className="flex h-8 min-w-[2.1rem] items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-1 text-sm font-semibold text-slate-800">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor, item.selectedStyle)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:border-stone-700 hover:text-stone-900"
                      aria-label={`Increase quantity for ${item.name}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      removeFromCart(
                        item.id,
                        item.selectedSize,
                        item.selectedColor,
                        item.selectedStyle,
                      )
                    }
                    aria-label={`Remove ${item.name} from cart`}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 sm:text-sm"
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-4">
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              Order Summary
            </h2>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(subtotal)}
                </span>
              </div>

            </div>

            <div className="my-4 border-t border-slate-200" />

            <div className="flex items-center justify-between gap-3 text-base font-bold text-slate-900 sm:text-lg">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="mt-5 h-12 w-full bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-stone-700 sm:text-base"
            >
              Proceed to Checkout
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Cart;
