import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailsInteractive } from "@/components/product-details-interactive";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getProductByHandle } from "@/lib/shopify";

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

  return (
    <>
      <SiteHeader />
      <main className="product-page page-gutter">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/collections/all">Shop all</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.title}</span>
        </nav>

        <ProductDetailsInteractive product={product} />
      </main>
      <SiteFooter />
    </>
  );
}
