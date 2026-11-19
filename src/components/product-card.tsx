import Image from "next/image";
import Link from "next/link";
import { formatMoney, type ShopifyProduct } from "@/lib/shopify";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const image = product.featuredImage;

  return (
    <article className="product-card">
      <Link
        className="product-image-link"
        href={`/products/${product.handle}`}
        aria-label={`View ${product.title}`}
      >
        <div className="product-image-frame">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText || product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="product-image"
            />
          ) : (
            <div className="product-image-missing" aria-hidden="true" />
          )}
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
