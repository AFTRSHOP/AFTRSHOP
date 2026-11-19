"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/context/cart-context";
import { formatMoney } from "@/lib/shopify";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    totalQuantity,
    subtotal,
    currencyCode,
    updateQuantity,
    removeItem,
    checkout,
    isLoading,
  } = useCart();

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="cart-portal" role="dialog" aria-modal="true" aria-label="Shopping Cart">
      {/* Backdrop */}
      <div className="cart-backdrop" onClick={closeCart} aria-hidden="true" />

      {/* Drawer Container */}
      <aside className="cart-drawer">
        {/* Header */}
        <div className="cart-header">
          <div className="cart-title-wrap">
            <h2 className="cart-title">Your Bag</h2>
            <span className="cart-count-badge">({totalQuantity})</span>
          </div>
          <button
            type="button"
            className="cart-close-btn"
            onClick={closeCart}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <p className="cart-empty-text">Your bag is currently empty.</p>
              <p className="cart-empty-sub">Explore our after-dark uniform pieces and add items to your cart.</p>
              <Link
                href="/collections/all"
                className="button button-light cart-explore-btn"
                onClick={closeCart}
              >
                Shop the collection <span aria-hidden="true">↗</span>
              </Link>
            </div>
          ) : (
            <ul className="cart-items-list" aria-label="Cart items">
              {items.map((item) => (
                <li key={item.variantId} className="cart-item">
                  <div className="cart-item-image">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="84px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="cart-item-image-missing" />
                    )}
                  </div>

                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <h3 className="cart-item-title">
                        {item.handle ? (
                          <Link href={`/products/${item.handle}`} onClick={closeCart}>
                            {item.title}
                          </Link>
                        ) : (
                          item.title
                        )}
                      </h3>
                      <button
                        type="button"
                        className="cart-item-remove-btn"
                        onClick={() => removeItem(item.variantId)}
                        aria-label={`Remove ${item.title}`}
                      >
                        ✕
                      </button>
                    </div>

                    {item.variantTitle && item.variantTitle !== "Default Title" && (
                      <p className="cart-item-variant">{item.variantTitle}</p>
                    )}

                    <div className="cart-item-bottom">
                      <div className="cart-item-qty-controls">
                        <button
                          type="button"
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="cart-qty-val">{item.quantity}</span>
                        <button
                          type="button"
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <span className="cart-item-price">
                        {formatMoney(String(item.price * item.quantity), item.currencyCode || currencyCode)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal-row">
              <span className="cart-subtotal-label">Subtotal</span>
              <span className="cart-subtotal-amount">
                {formatMoney(String(subtotal), currencyCode)}
              </span>
            </div>

            <p className="cart-shipping-note">
              Shipping & taxes calculated at Shopify checkout
            </p>

            <button
              type="button"
              className="buy-button cart-checkout-btn"
              onClick={checkout}
              disabled={isLoading}
            >
              {isLoading ? "Opening Shopify Checkout…" : "Checkout with Shopify →"}
            </button>

            <div className="cart-payment-methods">
              <span>Secure checkout · Credit card · Shop Pay · Apple Pay · Google Pay</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
