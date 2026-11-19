import { ProductCard } from "@/components/product-card";
import type { ShopifyProduct } from "@/lib/shopify";

export function ProductGrid({
  products,
  connected,
}: {
  products: ShopifyProduct[];
  connected: boolean;
}) {
  if (!products.length) {
    return (
      <div className="catalog-message" role="status">
        {connected
          ? "The collection is being updated. Check back soon."
          : "The collection is temporarily unavailable. Please try again shortly."}
      </div>
    );
  }

  return (
    <ul className="product-grid" aria-label="Shop the latest collection">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
