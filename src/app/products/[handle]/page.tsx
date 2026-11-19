import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductPurchase } from "@/components/product-purchase";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatMoney, getProductByHandle } from "@/lib/shopify";

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  return product
    ? {
        title: `${product.title} | AFTRSHOP`,
        description: product.description.slice(0, 160) || `Shop ${product.title} at AFTRSHOP.`,
      }
    : { title: "Piece not found | AFTRSHOP" };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();

  const gallery = product.images.length
    ? product.images
    : product.featuredImage
      ? [product.featuredImage]
      : [];

  return (
    <>
      <SiteHeader />
      <main className="product-page page-gutter">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/collections/all">Shop all</Link><span aria-hidden="true">/</span><span aria-current="page">{product.title}</span>
        </nav>
        <div className="product-layout">
          <div className="product-gallery" aria-label={`${product.title} images`}>
            {gallery.length ? gallery.map((image, index) => (
              <div className="product-detail-image" key={`${image.url}-${index}`}>
                <Image
                  src={image.url}
                  alt={image.altText || `${product.title} — view ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 760px) 100vw, 58vw"
                  className="product-image"
                />
              </div>
            )) : (
              <div className="product-detail-image product-image-missing" aria-label={`No image available for ${product.title}`} />
            )}
          </div>
          <section className="product-info" aria-labelledby="product-title">
            <p className="eyebrow">AFTRSHOP / Essential</p>
            <h1 id="product-title">{product.title}</h1>
            <p className="product-price">{formatMoney(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}</p>
            {product.description && <p className="product-description">{product.description}</p>}
            <ProductPurchase variants={product.variants} />
            <div className="product-detail-rule" />
            <p className="product-detail-note">A considered piece for the hours that belong to you.</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
