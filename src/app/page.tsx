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
                src="/assets/hero-banner.png"
                alt="AFTR - After the sun. On your terms."
                fill
                priority
                unoptimized
                sizes="100vw"
                className="hero-banner-image"
              />
            </div>
          </Link>
          <h1 id="hero-title" className="sr-only">After the sun. On your terms.</h1>
        </section>

        {/* Upcoming Drops */}
        <section className="upcoming-section page-gutter" id="upcoming" aria-labelledby="upcoming-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Dropping soon</p>
              <h2 id="upcoming-title">The next chapter.</h2>
            </div>
          </div>
          <ul className="upcoming-grid" aria-label="Upcoming products">
            <li className="upcoming-card">
              <div className="upcoming-image-frame">
                <Image
                  src="/assets/upcoming-womens-oversized-tee.png"
                  alt="AFTR After Dark — Women's Oversized Tee"
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="upcoming-image"
                />
                <span className="upcoming-badge" aria-label="Coming soon">Coming Soon</span>
              </div>
              <div className="upcoming-card-copy">
                <p className="upcoming-vol">Vol. 001 · After Dark</p>
                <h3>Women's Oversized Tee</h3>
                <p className="upcoming-desc">The after-hours silhouette — relaxed, raw, and yours.</p>
                <span className="upcoming-notify">Notify me ↗</span>
              </div>
            </li>
            <li className="upcoming-card">
              <div className="upcoming-image-frame">
                <Image
                  src="/assets/upcoming-womens-crop-top.png"
                  alt="AFTR After Dark — Women's Crop Top"
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="upcoming-image"
                />
                <span className="upcoming-badge" aria-label="Coming soon">Coming Soon</span>
              </div>
              <div className="upcoming-card-copy">
                <p className="upcoming-vol">Vol. 001 · After Dark</p>
                <h3>Women's Crop Top</h3>
                <p className="upcoming-desc">Cut for the ones who move on their own terms.</p>
                <span className="upcoming-notify">Notify me ↗</span>
              </div>
            </li>
          </ul>
        </section>

        {/* Current Collection / Shop All */}
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
