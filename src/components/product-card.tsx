import Image from "next/image";
import Link from "next/link";
import { formatMoney, type ShopifyProduct } from "@/lib/shopify";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const imageUrl = product.handle === "trilayer-terry-oversized-tee" 
    ? "/assets/colours.png" 
    : (product.featuredImage?.url || "/assets/colours.png");

  return (
    <article className="product-card">
      <Link
        className="product-image-link"
        href={`/products/${product.handle}`}
        aria-label={`View ${product.title}`}
      >
        <div className="product-image-frame">
          <Image
            src={imageUrl}
            alt={product.featuredImage?.altText || product.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="product-image"
          />
          {!product.availableForSale && <span className="product-badge">Sold out</span>}
          <span className="product-view" aria-hidden="true">View piece <span>↗</span></span>
        </div>
      </Link>
      <div className="product-card-copy">
        <h3><Link href={`/products/${product.handle}`}>{product.title}</Link></h3>
        <p>{formatMoney(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}</p>
      </div>
    </article>
  );
}
