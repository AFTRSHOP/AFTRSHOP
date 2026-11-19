import type { Metadata } from "next";
import { ProductGrid } from "@/components/product-grid";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getProducts } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Shop all | AFTRSHOP",
  description: "Explore the current AFTRSHOP streetwear collection.",
};

export default async function CollectionPage() {
  const { products, connected } = await getProducts(50);

  return (
    <>
      <SiteHeader />
      <main className="collection-page page-gutter">
        <div className="collection-page-heading">
          <p className="eyebrow">AFTRSHOP / Collection 01</p>
          <h1>Shop all.</h1>
          <p className="collection-intro">Pieces for after hours and everything that follows.</p>
        </div>
        <ProductGrid products={products} connected={connected} />
      </main>
      <SiteFooter />
    </>
  );
}
