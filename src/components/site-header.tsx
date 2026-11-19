import Image from "next/image";
import Link from "next/link";
import { CartTrigger } from "@/components/cart-trigger";

export function SiteHeader() {
  return (
    <>
      <div className="announcement-bar">Built for the hours that last</div>
      <header className="site-header">
        <div className="header-inner">
          <Link className="site-logo-link" href="/" aria-label="AFTR home">
            <Image
              src="/assets/aftr-logo.png"
              alt="AFTR"
              width={112}
              height={36}
              priority
              className="site-logo-img"
            />
          </Link>

          <nav className="desktop-nav" aria-label="Main navigation">
            <Link href="/collections/all">Shop all</Link>
            <Link href="/#our-standard">Our standard</Link>
          </nav>

          <div className="header-actions">
            <Link className="header-shop-link" href="/collections/all">
              Explore the collection <span aria-hidden="true">↗</span>
            </Link>

            <CartTrigger />

            <details className="mobile-menu">
              <summary aria-label="Open menu">Menu</summary>
              <nav aria-label="Mobile navigation">
                <Link href="/collections/all">Shop all</Link>
                <Link href="/#our-standard">Our standard</Link>
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}
