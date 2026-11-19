"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useCart } from "@/context/cart-context";
import { formatMoney, type ShopifyProduct } from "@/lib/shopify";

type ProductDetailsInteractiveProps = {
  product: ShopifyProduct;
};

export function ProductDetailsInteractive({ product }: ProductDetailsInteractiveProps) {
  const { variants, featuredImage, title, description, priceRange } = product;

  // Available options
  const colorOptions = useMemo(() => {
    const list: string[] = [];
    for (const v of variants) {
      const colorOpt = v.selectedOptions.find(
        (o) => o.name.toLowerCase() === "color" || o.name.toLowerCase() === "colour"
      );
      if (colorOpt && !list.includes(colorOpt.value)) {
        list.push(colorOpt.value);
      }
    }
    return list.length > 0 ? list : ["Black", "Navy Blue"];
  }, [variants]);

  const sizeOptions = useMemo(() => {
    const list: string[] = [];
    for (const v of variants) {
      const sizeOpt = v.selectedOptions.find(
        (o) => o.name.toLowerCase() === "size"
      );
      if (sizeOpt && !list.includes(sizeOpt.value)) {
        list.push(sizeOpt.value);
      }
    }
    return list.length > 0 ? list : ["M", "L", "XL"];
  }, [variants]);

  const [selectedColor, setSelectedColor] = useState<string>(colorOptions[0] || "Black");
  const [selectedSize, setSelectedSize] = useState<string>(sizeOptions[0] || "M");
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const { addItem, checkout } = useCart();

  // Find currently matched variant
  const currentVariant = useMemo(() => {
    return (
      variants.find((v) => {
        const c = v.selectedOptions.find(
          (o) => o.name.toLowerCase() === "color" || o.name.toLowerCase() === "colour"
        );
        const s = v.selectedOptions.find((o) => o.name.toLowerCase() === "size");
        return c?.value === selectedColor && s?.value === selectedSize;
      }) ||
      variants.find((v) => {
        const c = v.selectedOptions.find(
          (o) => o.name.toLowerCase() === "color" || o.name.toLowerCase() === "colour"
        );
        return c?.value === selectedColor;
      }) ||
      variants[0] ||
      null
    );
  }, [variants, selectedColor, selectedSize]);

  // Image switches between black.png and navyblue.png
  const activeImageUrl = useMemo(() => {
    const lower = selectedColor.toLowerCase();
    if (lower.includes("navy")) {
      return "/assets/navyblue.png";
    }
    return "/assets/black.png";
  }, [selectedColor]);

  const handleAddToCart = () => {
    if (!currentVariant || !currentVariant.availableForSale) return;

    addItem(
      {
        variantId: currentVariant.id,
        productId: product.id,
        title: product.title,
        variantTitle: `${selectedColor} / ${selectedSize}`,
        price: Number(currentVariant.price.amount),
        currencyCode: currentVariant.price.currencyCode,
        image: activeImageUrl,
        handle: product.handle,
      },
      quantity,
    );
  };

  const handleBuyNow = async () => {
    if (!currentVariant || !currentVariant.availableForSale || busy) return;

    setBusy(true);
    setMessage("");

    try {
      addItem(
        {
          variantId: currentVariant.id,
          productId: product.id,
          title: product.title,
          variantTitle: `${selectedColor} / ${selectedSize}`,
          price: Number(currentVariant.price.amount),
          currencyCode: currentVariant.price.currencyCode,
          image: activeImageUrl,
          handle: product.handle,
        },
        quantity,
      );

      await checkout();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to initiate checkout.");
      setBusy(false);
    }
  };

  return (
    <div className="product-layout">
      {/* Product Image on Left (exact original aspect ratio & size) */}
      <div className="product-gallery" aria-label={`${title} images`}>
        <div className="product-detail-image">
          <Image
            src={activeImageUrl}
            alt={`${title} in ${selectedColor}`}
            fill
            priority
            sizes="(max-width: 760px) 100vw, 58vw"
            className="product-image"
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>

      {/* Product Info on Right */}
      <section className="product-info" aria-labelledby="product-title">
        <p className="eyebrow">AFTR / Essential</p>
        <h1 id="product-title">{title}</h1>
        <p className="product-price">
          {formatMoney(
            currentVariant?.price.amount || priceRange.minVariantPrice.amount,
            currentVariant?.price.currencyCode || priceRange.minVariantPrice.currencyCode,
          )}
        </p>

        {description && <p className="product-description">{description}</p>}

        <div className="purchase-panel">
          {/* Color Pills (Clean Shopify Style) */}
          <div className="pill-option-group">
            <span className="pill-option-label">color: {selectedColor}</span>
            <div className="pill-buttons-row">
              {colorOptions.map((color) => {
                const isActive = selectedColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    className={`pill-btn ${isActive ? "pill-btn-active" : ""}`}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Pills (Clean Shopify Style) */}
          <div className="pill-option-group">
            <span className="pill-option-label">size: {selectedSize}</span>
            <div className="pill-buttons-row">
              {sizeOptions.map((size) => {
                const isActive = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    className={`pill-btn pill-btn-size ${isActive ? "pill-btn-active" : ""}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="pill-option-group">
            <span className="pill-option-label">Quantity</span>
            <div className="quantity-counter">
              <button
                type="button"
                className="quantity-counter-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="quantity-counter-val">{quantity}</span>
              <button
                type="button"
                className="quantity-counter-btn"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Bag Button */}
          <button
            className="button button-light add-to-bag-btn"
            type="button"
            onClick={handleAddToCart}
            disabled={!currentVariant?.availableForSale}
          >
            {currentVariant?.availableForSale ? "Add to cart" : "Sold out"}
          </button>

          {/* Buy Now Button */}
          <button
            className="buy-button buy-now-btn"
            type="button"
            onClick={handleBuyNow}
            disabled={!currentVariant?.availableForSale || busy}
          >
            {busy
              ? "Connecting to Shopify…"
              : currentVariant?.availableForSale
                ? "Buy it now"
                : "Sold out"}
          </button>

          <p className="purchase-caption">Official Shopify checkout · 100% secure payment</p>
          {message && (
            <p className="purchase-message" aria-live="polite" role="status">
              {message}
            </p>
          )}

          <div className="product-detail-rule" />
          <p className="product-detail-note">A considered piece for the hours that belong to you.</p>
        </div>
      </section>
    </div>
  );
}
