"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { formatMoney, type ShopifyProduct, type ShopifyVariant } from "@/lib/shopify";

type ProductPurchaseProps = {
  variants: ShopifyVariant[];
  product?: Pick<ShopifyProduct, "id" | "title" | "handle" | "featuredImage">;
};

export function ProductPurchase({ variants, product }: ProductPurchaseProps) {
  const firstAvailable = variants.find((variant) => variant.availableForSale) ?? variants[0];
  const [selectedId, setSelectedId] = useState(firstAvailable?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const { addItem, checkout } = useCart();
  const selectedVariant = variants.find((variant) => variant.id === selectedId);

  const handleAddToCart = () => {
    if (!selectedVariant || !selectedVariant.availableForSale) return;

    addItem(
      {
        variantId: selectedVariant.id,
        productId: product?.id,
        title: product?.title || "Piece",
        variantTitle: selectedVariant.title !== "Default Title" ? selectedVariant.title : undefined,
        price: Number(selectedVariant.price.amount),
        currencyCode: selectedVariant.price.currencyCode,
        image: product?.featuredImage?.url,
        handle: product?.handle,
      },
      1,
    );
  };

  const handleBuyNow = async () => {
    if (!selectedVariant || !selectedVariant.availableForSale || busy) return;

    setBusy(true);
    setMessage("");

    try {
      addItem(
        {
          variantId: selectedVariant.id,
          productId: product?.id,
          title: product?.title || "Piece",
          variantTitle: selectedVariant.title !== "Default Title" ? selectedVariant.title : undefined,
          price: Number(selectedVariant.price.amount),
          currencyCode: selectedVariant.price.currencyCode,
          image: product?.featuredImage?.url,
          handle: product?.handle,
        },
        1,
      );

      await checkout();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to initiate checkout.");
      setBusy(false);
    }
  };

  if (!variants.length) {
    return <p className="purchase-note">This piece is currently unavailable.</p>;
  }

  return (
    <div className="purchase-panel">
      <label className="variant-label" htmlFor="product-variant">
        Select an option
      </label>
      <select
        id="product-variant"
        className="variant-select"
        value={selectedId}
        onChange={(event) => setSelectedId(event.target.value)}
      >
        {variants.map((variant) => (
          <option key={variant.id} value={variant.id} disabled={!variant.availableForSale}>
            {variant.title} {variant.availableForSale ? "" : " — Sold out"}
          </option>
        ))}
      </select>

      <button
        className="button button-light"
        style={{ width: "100%", minHeight: "52px" }}
        type="button"
        onClick={handleAddToCart}
        disabled={!selectedVariant?.availableForSale}
      >
        {selectedVariant?.availableForSale ? "Add to Bag" : "Sold out"}
      </button>

      <button
        className="buy-button"
        type="button"
        onClick={handleBuyNow}
        disabled={!selectedVariant?.availableForSale || busy}
      >
        {busy
          ? "Connecting to Shopify…"
          : selectedVariant?.availableForSale
            ? `Buy now · ${formatMoney(selectedVariant.price.amount, selectedVariant.price.currencyCode)}`
            : "Sold out"}
      </button>

      <p className="purchase-caption">Secure checkout powered by Shopify</p>
      {message && (
        <p className="purchase-message" aria-live="polite" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
