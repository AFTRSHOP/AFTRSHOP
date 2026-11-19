"use client";

import { useState } from "react";
import { formatMoney, type ShopifyVariant } from "@/lib/shopify";

export function ProductPurchase({ variants }: { variants: ShopifyVariant[] }) {
  const firstAvailable = variants.find((variant) => variant.availableForSale) ?? variants[0];
  const [selectedId, setSelectedId] = useState(firstAvailable?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const selectedVariant = variants.find((variant) => variant.id === selectedId);

  async function beginCheckout() {
    if (!selectedVariant || !selectedVariant.availableForSale || busy) return;

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchandiseId: selectedVariant.id }),
      });
      const result = (await response.json()) as { checkoutUrl?: string; error?: string };

      if (!response.ok || !result.checkoutUrl) {
        throw new Error(result.error || "Checkout is unavailable right now.");
      }

      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout is unavailable right now.");
      setBusy(false);
    }
  }

  if (!variants.length) {
    return <p className="purchase-note">This piece is currently unavailable.</p>;
  }

  return (
    <div className="purchase-panel">
      <label className="variant-label" htmlFor="product-variant">Select an option</label>
      <select
        id="product-variant"
        className="variant-select"
        value={selectedId}
        onChange={(event) => setSelectedId(event.target.value)}
      >
        {variants.map((variant) => (
          <option key={variant.id} value={variant.id} disabled={!variant.availableForSale}>
            {variant.title}{variant.availableForSale ? "" : " — Sold out"}
          </option>
        ))}
      </select>
      <button
        className="buy-button"
        type="button"
        onClick={beginCheckout}
        disabled={!selectedVariant?.availableForSale || busy}
      >
        {busy
          ? "Opening checkout…"
          : selectedVariant?.availableForSale
            ? `Buy now · ${formatMoney(selectedVariant.price.amount, selectedVariant.price.currencyCode)}`
            : "Sold out"}
      </button>
      <p className="purchase-caption">Secure checkout powered by Shopify</p>
      <p className="purchase-message" aria-live="polite" role="status">{message}</p>
    </div>
  );
}
