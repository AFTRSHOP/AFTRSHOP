import Image from "next/image";
import Link from "next/link";
import { ProductGrid } from "@/components/product-grid";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getProducts } from "@/lib/shopify";

export default async function HomePage() {
  const { products, connected } = await getProducts(8);

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero Campaign Banner */}
        <section className="hero-banner-container" aria-labelledby="hero-title">
          <Link href="#shop" className="hero-banner-link" aria-label="Discover the collection">
            <div className="hero-banner-frame">
              <Image
                src="/assets/hero-banner.jpg"
                alt="AFTR - After the sun. On your terms."
                fill
                priority
                sizes="100vw"
                className="hero-banner-image"
              />
              <div className="hero-banner-btn-wrap">
                <span className="hero-banner-cta">
                  Explore the collection <span aria-hidden="true">↘</span>
                </span>
              </div>
            </div>
          </Link>
          <h1 id="hero-title" className="sr-only">After the sun. On your terms.</h1>
        </section>

        <section className="collection-section page-gutter" id="shop" aria-labelledby="collection-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The current rotation</p>
              <h2 id="collection-title">Keep your own hours.</h2>
            </div>
            <Link className="text-link" href="/collections/all">
              Shop all <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <ProductGrid products={products} connected={connected} />
        </section>

        <section className="standard-section page-gutter" id="our-standard" aria-labelledby="standard-title">
          <div className="standard-intro">
            <p className="eyebrow">The AFTR standard</p>
            <h2 id="standard-title">No uniform<br />but your own.</h2>
          </div>
          <div className="standard-copy">
            <p className="standard-lede">Made for the in-between hours, the long way home, and every move that belongs to you.</p>
            <p>Considered layers. Direct lines. Nothing to prove and nothing extra. Wear it your way, wherever the night takes you.</p>
            <Link className="text-link" href="/collections/all">
              Find your next piece <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <span className="standard-mark" aria-hidden="true">A</span>
        </section>

        <section className="closing-section page-gutter" aria-labelledby="closing-title">
          <p className="eyebrow">The night is yours</p>
          <h2 id="closing-title">Move different.</h2>
          <Link className="button button-dark" href="/collections/all">
            Shop AFTR <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
